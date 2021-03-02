const moment = require('moment');

const models = require('../../../../models');

const findInactiveWorkplaces = async () => {
  const lastUpdated = moment().subtract(6, 'months').format('YYYY-MM-DD');

  const inactiveWorkplaces = await models.sequelize.query(
    `
  SELECT
	"EstablishmentID",
  "NameValue",
  "NmdsID",
  "DataOwner",
  "PrimaryUserName",
  "PrimaryUserEmail",
	"LastUpdated",
	(
		SELECT
			MAX(ech. "createdAt")
		FROM
			cqc."EmailCampaignHistories" ech
		WHERE
			ech. "establishmentID" = e. "EstablishmentID") AS "LastEmailedDate", (
			SELECT
				COUNT(*)
			FROM
				cqc."EmailCampaignHistories" ech
      JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
			WHERE
				ec."type" = 'inactiveWorkplaces'
				AND ech."establishmentID" = e."EstablishmentID"
				AND ech."createdAt" > "LastUpdated") AS EmailCount
		FROM
			cqc. "LastUpdatedEstablishments" e
		WHERE
      "ParentID" IS NULL
      AND "IsParent" = FALSE
			AND "LastUpdated" < :lastUpdated
			AND NOT EXISTS (
				SELECT
					ech. "establishmentID"
				FROM
					cqc."EmailCampaignHistories" ech
        JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
				WHERE
          ec."type" = 'inactiveWorkplaces'
					AND ech."createdAt" > :lastUpdated
					AND ech. "establishmentID" = e. "EstablishmentID");`,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: { lastUpdated },
    },
  );

  return inactiveWorkplaces.map((inactiveWorkplace) => {
    return {
      id: inactiveWorkplace.EstablishmentID,
      name: inactiveWorkplace.NameValue,
      nmdsId: inactiveWorkplace.NmdsID,
      lastUpdated: inactiveWorkplace.LastUpdated,
      emailTemplateId: 13,
      dataOwner: inactiveWorkplace.DataOwner,
      user: {
        name: inactiveWorkplace.PrimaryUserName,
        email: inactiveWorkplace.PrimaryUserEmail,
      },
    };
  });
};

module.exports = {
  findInactiveWorkplaces,
};
