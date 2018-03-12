import { host, database } from './influxConfig';

const Influx = require('influx');

const FieldType = Influx.FieldType;

const influx = new Influx.InfluxDB({
  host,
  database,
});

export default influx;
