class NotFoundError extends Error {
  // custom error to avoid directly throwing HttpError in models
  constructor(message) {
    super(message);
  }
}

module.exports = { NotFoundError };
