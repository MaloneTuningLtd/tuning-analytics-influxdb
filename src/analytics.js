import client from './client';

export default {
  requestEvents: (page = 0) => client.get('/analytics/requestevent', {
    params: {
      page,
    },
  }),
};
