export default (requestEvent) => {
  const tuneRequest = requestEvent.tune_request;
  const tool = tuneRequest.tool;

  const infoMap = tuneRequest.infos.reduce((dict, { name, value }) => {
    dict[name] = value;
    return dict;
  }, {});

  const fileMap = tuneRequest.files.reduce((dict, { id, name, original_name, size }) => {
    dict[name] = {
      id,
      type: name,
      name: original_name,
      size,
    };

    return dict;
  }, {});

  return {
    id: requestEvent.id,
    time: requestEvent.time,
    status: requestEvent.status,

    worker: {
      id: requestEvent.worker_id,
      name: requestEvent.worker,
    },

    attempts: {
      current: requestEvent.attempts_current,
      max: requestEvent.attempts_max,
    },

    tool: {
      id: tool.id,
      name: tool.name,
    },

    request: {
      id: tuneRequest.id,
      method: tuneRequest.method,
      info: infoMap,
      files: fileMap,
      childRequest: tuneRequest.tune_request_id !== null,
    },

    user: {
      id: tuneRequest.user_id,
      name: tuneRequest.user_name,
    },
  };
};
