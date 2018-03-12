import analytics from './analytics';
import normalizeRequestEvent from './normalizeRequestEvent';
import influxClient from './influxClient';

const flat = require('flat');
const storage = require('node-persist');

storage.initSync();

// log stub - maybe use winston? idk
const log = (message) => {
  console.log(message);
  return Promise.resolve();
};

const createDbIfNotExist = (client, db) => {
  return client.getDatabaseNames()
    .then((names) => {
      if (names.includes(db)) {
        log(`Database "${db}" exists, not creating...`);
        return Promise.resolve();
      }

      log(`Database "${db}" does not exist, creating...`);
      return client.createDatabase(db);
    });
};

const getScrapeData = ls => ls.getItemSync('lastScrape');
const setScrapeData = (ls, data) => ls.setItemSync('lastScrape', data);

const setScrapeDataIfNotExist = (ls) => {
  log('Checking if we have previously scraped data...');
  const lastScrape = getScrapeData(ls);

  if (!lastScrape) {
    log('No data has previously been scraped - starting over!');
    setScrapeData(ls, {
      page: 1,
      id: 0,
    });
  } else {
    log(`Previous state: page ${lastScrape.page} at ID ${lastScrape.id}`);
  }

  return Promise.resolve();
}

const getEvents = lastPage => analytics.requestEvents(lastPage || 1)
  .then(resp => resp.data);

const filterNewEvents = (events, lastId) => events.filter(event => event.id > lastId);

const eventToInflux = (event) => {
  const influxableEvent = flat(event);
  Object.entries(influxableEvent).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete influxableEvent[key];
      return;
    }

    // empty object
    if (typeof value === 'object' && Object.keys(value).length <= 0) {
      delete influxableEvent[key];
      return;
    }
  });

  const timestamp = influxableEvent.time;

  const tags = {
    status: influxableEvent.status,
    worker: influxableEvent['worker.name'],
    user: influxableEvent['user.name'],
    tool: influxableEvent['tool.name'],
    method: influxableEvent['request.method'],
    parent: influxableEvent['request.childRequest'] ? 'no' : 'yes',
  };

  return {
    measurement: 'tuning_events',
    tags,
    fields: influxableEvent,
    timestamp,
  };
};

const state = {};

const initialize = () =>
  createDbIfNotExist(influxClient, influxClient.options.database)
  .then(() => setScrapeDataIfNotExist(storage));

const dataLoop = (func) => Promise.resolve()
  .then(() => {
  const lastScrape = getScrapeData(storage);
  return getEvents(lastScrape.page)
  .then((data) => {
    const newEvents = filterNewEvents(data.data, lastScrape.id)
      .map(normalizeRequestEvent)
      .map(eventToInflux);

    const lastPage = data.last_page;

    log(`Page ${lastScrape.page}/${lastPage}: ${newEvents.length} new events found`);

    if (newEvents.length <= 0) {
      return;
    }

    const highestId = data.data.reduce((acc, { id }) => Math.max(acc, id), 0);
    const hasNextPage = data.last_page > data.current_page;
    const page = hasNextPage ? data.current_page + 1 : data.current_page;

    return influxClient.writePoints(newEvents, {
      precision: 's',
    }).then(() => {
      setScrapeData(storage, {
        page,
        id: highestId,
      });

      if (hasNextPage) {
        return func(func);
      }
    });
  });
});

const DELAY = 30000;

const delay = (ms) => new Promise((resolve) => {
  log(`Waiting ${ms}ms`);
  setTimeout(resolve, ms);
});

const loopWithDelay = (somethingToDo, func) => {
  return somethingToDo()
    .then(() => delay(DELAY))
    .then(() => func(somethingToDo, func));
};

initialize()
.then(() => loopWithDelay(
  () => dataLoop(dataLoop),
  loopWithDelay,
));