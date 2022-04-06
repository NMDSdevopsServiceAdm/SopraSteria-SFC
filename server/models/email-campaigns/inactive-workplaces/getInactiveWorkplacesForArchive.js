const moment = require('moment');

const models = require('../../index');

const refreshInactiveWorkplacesForArchive = async () => {
  return models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."EstablishmentLastActivity"');
};

const getInactiveWorkplacesForArchive = async () => {
  const twentyFourLastMonths = moment().subtract(24, 'months').format('YYYY-MM-DD');

  const result = await models.sequelize.query(
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
  "Address3"

  	FROM
  		cqc."EstablishmentLastActivity" e
  	WHERE
      "IsParent" = FALSE
      AND "DataOwner" = 'Workplace'

  		AND "LastLogin" >= :twentyFourLastMonths
      AND "LastUpdated" >= :twentyFourLastMonths
      `,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        twentyFourLastMonths,
      },
    },
  );

  return result;
};

module.exports = {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
};
