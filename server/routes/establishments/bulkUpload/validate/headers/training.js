const { trainingHeaders } = require('../../data/trainingHeaders');

const validateTrainingHeaders = (headers) => {
  return trainingHeaders === headers;
};

module.exports = {
  validateTrainingHeaders,
};
