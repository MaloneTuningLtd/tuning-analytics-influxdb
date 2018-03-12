import { host, key } from './clientConfig';

const axios = require('axios');

const instance = axios.create({
  baseURL: host,
  headers: {
    'X-Authorization': key,
  },
});

export default instance;
