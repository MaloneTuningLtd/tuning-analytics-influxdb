# Tuning Influx Forwarder

Hi

## Config

The following ENV vars are used:

- API_URL: The base API url to use, including schema. Example: `https://foo.bar/api/`
- API_KEY: Authorized API key. Example: `hi`
- INFLUX_HOST: Some influx host. Defaults to `localhost`
- INFLUX_DB: Influx database name. Doesn't need to exist. Defaults to `tuning-request-events`.
