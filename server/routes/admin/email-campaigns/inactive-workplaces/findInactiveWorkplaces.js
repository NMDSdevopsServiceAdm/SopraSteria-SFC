const models = require('../../../../models');

const findInactiveWorkplaces = async () => {
  const inactiveWorkplaces = await models.sequelize.query(
    `
  SELECT
	"EstablishmentID",
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
			AND "LastUpdated" < '2020-08-01'
			AND NOT EXISTS (
				SELECT
					ech. "establishmentID"
				FROM
					cqc."EmailCampaignHistories" ech
        JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
				WHERE
          ec."type" = 'inactiveWorkplaces'
					AND ech."createdAt" > '2020-08-01'
					AND ech. "establishmentID" = e. "EstablishmentID")
			ORDER BY
				EmailCount DESC;`,
    {
      type: models.sequelize.QueryTypes.SELECT,
    },
  );

  return inactiveWorkplaces.map(inactiveWorkplace => {
    return {
      id: inactiveWorkplace.EstablishmentID,
      nmdsId: inactiveWorkplace.NmdsID,
      lastUpdated: inactiveWorkplace.LastUpdated,
      emailTemplateId: 6,
      dataOwner: inactiveWorkplace.DataOwner,
      user: {
        name: inactiveWorkplace.PrimaryUserName,
        email: inactiveWorkplace.PrimaryUserEmail,
      }
    }
  });
};

module.exports = {
  findInactiveWorkplaces,
};
