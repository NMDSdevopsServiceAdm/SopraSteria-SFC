const models = require('../../models');

module.exports.refreshEstablishmentLastActivityView = async () => {
  return models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."EstablishmentLastActivity"');
};
