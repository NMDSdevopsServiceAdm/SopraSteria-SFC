const buildGetObjectResponseBody = (content) => {
  const response = {
    transformToString: () => Promise.resolve(content),
  };
  return response;
};

module.exports = { buildGetObjectResponseBody };
