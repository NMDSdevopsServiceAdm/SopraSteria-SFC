const moment = require('moment');

const models = require('../../index');

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
    "PostCode",
    "LocationID",
    "ParentNmdsID"
  FROM
  	cqc."EstablishmentLastActivity" e

  WHERE
  	(e."LastLogin" <= :twentyFourLastMonths OR e."LastLogin" is null)
	  AND e."LastUpdated" <= :twentyFourLastMonths
    AND NOT EXISTS
    (
       SELECT s."EstablishmentID" AS EstablishmentID
          FROM cqc."EstablishmentLastActivity" s
          WHERE  s."IsParent" = true AND EXISTS
          (
            SELECT c."EstablishmentID"
             FROM cqc."EstablishmentLastActivity" c
              WHERE s."EstablishmentID" = c."ParentID"
              AND c."LastLogin" > :twentyFourLastMonths
              AND c."LastUpdated" > :twentyFourLastMonths
              AND c."IsParent"= false
           ) AND s."EstablishmentID"  =  e."EstablishmentID"
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
};
