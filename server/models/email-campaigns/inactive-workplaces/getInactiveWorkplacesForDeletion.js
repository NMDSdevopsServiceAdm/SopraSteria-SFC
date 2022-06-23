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
    e."EstablishmentID",
    "NameValue",
    TRIM("NmdsID") AS "NmdsID",
    "IsParent",
    "LastLogin",
    "LastUpdated",
    "DataOwner",
    "Address1",
    "Town",
    "County",
    "PostCode"
  FROM
  	cqc."EstablishmentLastActivity" e

  WHERE
  	e."LastLogin" <= :twentyFourLastMonths
	  AND e."LastUpdated" <= :twentyFourLastMonths
  	AND ("IsParent" = false OR
	NOT EXISTS(
		SELECT
		  "EstablishmentID"
	  FROM
		  cqc."EstablishmentLastActivity" s
	  WHERE
		  e."EstablishmentID" = s."ParentID"
		  AND s."LastLogin" > :twentyFourLastMonths
		  AND s."LastUpdated" > :twentyFourLastMonths
	  )
  )
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
