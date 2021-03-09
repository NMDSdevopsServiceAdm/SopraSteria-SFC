const moment = require('moment');

const models = require('../../index');
const nextEmail = require('../../../services/email-campaigns/inactive-workplaces/nextEmail');

const refreshInactiveWorkplaces = async () => {
  return models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."LastUpdatedEstablishments"');
};

const getInactiveWorkplaces = async () => {
  const lastMonth = moment().subtract(1, 'months');

  const lastUpdated = lastMonth.clone().subtract(6, 'months').endOf('month').endOf('day').format('YYYY-MM-DD');
  const lastEmailDate = moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');

  return models.sequelize.query(
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
			"template"
		FROM
			cqc."EmailCampaignHistories" ech
    JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
		WHERE
      ec."type" = 'inactiveWorkplaces'
		  AND ech. "establishmentID" = e. "EstablishmentID"
      AND ech."createdAt" >= e."LastUpdated"
    ORDER BY ech. "createdAt" DESC
    LIMIT 1) AS "LastTemplate"
		FROM
			cqc. "LastUpdatedEstablishments" e
		WHERE
      "ParentID" IS NULL
      AND "IsParent" = FALSE
			AND "LastUpdated" <= :lastUpdated
			AND NOT EXISTS (
				SELECT
					ech. "establishmentID"
				FROM
					cqc."EmailCampaignHistories" ech
        JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
				WHERE
          ec."type" = 'inactiveWorkplaces'
					AND ech."createdAt" >= :lastEmailDate
					AND ech. "establishmentID" = e. "EstablishmentID");`,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        lastUpdated,
        lastEmailDate,
      },
    },
  );
};

const transformInactiveWorkplaces = (inactiveWorkplace) => {
  const { id, name } = nextEmail.getTemplate(inactiveWorkplace);

  return {
    id: inactiveWorkplace.EstablishmentID,
    name: inactiveWorkplace.NameValue,
    nmdsId: inactiveWorkplace.NmdsID,
    lastUpdated: inactiveWorkplace.LastUpdated,
    emailTemplate: {
      id,
      name,
    },
    dataOwner: inactiveWorkplace.DataOwner,
    user: {
      name: inactiveWorkplace.PrimaryUserName,
      email: inactiveWorkplace.PrimaryUserEmail,
    },
  };
};

const findInactiveWorkplaces = async () => {
  await refreshInactiveWorkplaces();
  const inactiveWorkplaces = await getInactiveWorkplaces();

  return inactiveWorkplaces.filter(nextEmail.shouldReceive).map(transformInactiveWorkplaces);
};

module.exports = {
  findInactiveWorkplaces,
};
