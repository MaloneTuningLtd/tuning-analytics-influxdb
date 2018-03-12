# Tuning Influx Forwarder

Forwards request events from a tuning service to influxdb.

## Config

The following ENV vars are used:

- API_URL: The base API url to use, including schema. Example: `https://foo.bar/api/`
- API_KEY: Authorized API key. Example: `hi`
- INFLUX_HOST: Some influx host. Defaults to `localhost`
- INFLUX_DB: Influx database name. Doesn't need to exist. Defaults to `tuning-request-events`.

This repository uses the `node-persist` package, with the default settings.

To carry over this data, mount and retain the `.node-persist` directory.
