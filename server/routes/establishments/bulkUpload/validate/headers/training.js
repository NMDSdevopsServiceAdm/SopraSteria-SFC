const { trainingHeaders } = require('../../data/trainingHeaders');

const validateTrainingHeaders = (headers) => trainingHeaders === headers;

module.exports = {
  validateTrainingHeaders,
};
