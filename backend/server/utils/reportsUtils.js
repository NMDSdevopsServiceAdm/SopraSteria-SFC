const inactiveWorkplacesUtils = require('./db/inactiveWorkplacesUtils');

module.exports.checkIfViewShouldRefresh = async (stopViewRefresh) => {
  if (stopViewRefresh !== 'true' || !stopViewRefresh) {
    await inactiveWorkplacesUtils.refreshEstablishmentLastActivityView();
  }
};
