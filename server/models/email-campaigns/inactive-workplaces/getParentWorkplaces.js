const moment = require('moment');

const models = require('../../index');

const getParentWorkplaces = async () => {
  const currentMonth = moment().startOf('month').format('YYYY-MM-DD');

  return models.sequelize.query(
    `
    SELECT
    *
  FROM
    cqc. "LastUpdatedEstablishments" e
  WHERE
    "IsParent" = TRUE
    AND NOT EXISTS (
      SELECT
        ech. "establishmentID"
      FROM
        cqc. "EmailCampaignHistories" ech
        JOIN cqc. "EmailCampaigns" ec ON ec. "id" = ech. "emailCampaignID"
      WHERE
        ec. "type" = 'inactiveWorkplaces'
        AND ech. "createdAt" >= :currentMonth
        AND ech. "establishmentID" = e. "EstablishmentID")
    UNION
    SELECT
      *
    FROM
      cqc. "LastUpdatedEstablishments" e
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
          AND ech. "createdAt" >= :currentMonth
          AND ech. "establishmentID" = e. "ParentID");`,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        currentMonth,
      },
    },
  );
};

module.exports = {
  getParentWorkplaces,
};
