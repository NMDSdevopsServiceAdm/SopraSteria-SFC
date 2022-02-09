const moment = require('moment');

const models = require('../../index');

const getParentWorkplaces = async () => {
  const lastEmailDate = moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');

  return models.sequelize.query(
    `
    SELECT
      "EstablishmentID",
      "NameValue",
      TRIM("NmdsID") AS "NmdsID",
      "ParentID",
      "IsParent",
      "DataOwner",
      "PrimaryUserName",
      "PrimaryUserEmail",
      "LastLogin",
      "LastUpdated",
  FROM
    cqc. "EstablishmentLastActivity" e
  WHERE
    "IsParent" = TRUE
    AND "PrimaryUserEmail" IS NOT NULL
    AND NOT EXISTS (
      SELECT
        ech. "establishmentID"
      FROM
        cqc. "EmailCampaignHistories" ech
        JOIN cqc. "EmailCampaigns" ec ON ec. "id" = ech. "emailCampaignID"
      WHERE
        ec. "type" = 'inactiveWorkplaces'
        AND ech. "createdAt" >= :lastEmailDate
        AND ech. "establishmentID" = e. "EstablishmentID")
    UNION
    SELECT
      "EstablishmentID",
      "NameValue",
      TRIM("NmdsID") AS "NmdsID",
      "ParentID",
      "IsParent",
      "DataOwner",
      "PrimaryUserName",
      "PrimaryUserEmail",
      "LastLogin",
      "LastUpdated",
    FROM
      cqc. "EstablishmentLastActivity" e
    WHERE
      "ParentID" IS NOT NULL
      AND "DataOwner" = 'Parent'
          AND NOT EXISTS (
        SELECT
          ech. "establishmentID"
        FROM
          cqc. "EmailCampaignHistories" ech
          JOIN cqc. "EmailCampaigns" ec ON ec. "id" = ech. "emailCampaignID"
        WHERE
          ec. "type" = 'inactiveWorkplaces'
          AND ech. "createdAt" >= :lastEmailDate
          AND ech. "establishmentID" = e. "ParentID");`,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        lastEmailDate,
      },
    },
  );
};

module.exports = {
  getParentWorkplaces,
};
