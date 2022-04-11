const moment = require('moment');

const models = require('../../index');

const refreshInactiveWorkplacesForDeletion = async () => {
  return models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."EstablishmentLastActivity"');
};

const getInactiveWorkplacesForDeletion = async () => {
  const lastMonth = moment().subtract(1, 'months').endOf('month');
  const twentyFourLastMonths = lastMonth.clone().subtract(24, 'months').format('YYYY-MM-DD');

  return await models.sequelize.query(
    `
  SELECT
  "EstablishmentID",
  "NameValue",
  TRIM("NmdsID") AS "NmdsID",
  "DataOwner",
  "PrimaryUserName",
  "PrimaryUserEmail",
  "LastLogin",
  "LastUpdated",
  "Address1",
  "Address2",
  "Address3",
  "Town",
  "County",
  "PostCode"

  	FROM
  		cqc."EstablishmentLastActivity" e
  	WHERE

       "DataOwner" = 'Workplace'
  		AND "LastLogin" <= :twentyFourLastMonths
      AND "LastUpdated" <= :twentyFourLastMonths
      `,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        twentyFourLastMonths,
      },
    },
  );
};

module.exports = {
  getInactiveWorkplacesForDeletion,
  refreshInactiveWorkplacesForDeletion,
};
