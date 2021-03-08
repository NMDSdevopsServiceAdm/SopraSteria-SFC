const moment = require('moment');

const config = require('../../../config/config');
const models = require('../../index');

const lastMonth = moment().subtract(1, 'months');

const nextEmailTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastUpdated);

  const sixMonths = lastMonth.clone().subtract(6, 'months');
  const twelveMonths = lastMonth.clone().subtract(12, 'months');
  const eighteenMonths = lastMonth.clone().subtract(18, 'months');
  const twentyFourMonths = lastMonth.clone().subtract(24, 'months');

  if (lastUpdated.isSame(sixMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.sixMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twelveMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twelveMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(eighteenMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.eighteenMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twentyFourMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twentyFourMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate.id ? nextTemplate : null;
  }

  return null;
};

const findInactiveWorkplaces = async () => {
  await models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."LastUpdatedEstablishments"');

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
        lastUpdated: lastMonth.clone().subtract(6, 'months').endOf('month').endOf('day').format('YYYY-MM-DD'),
        lastEmailDate: moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD'),
      },
    },
  );

  return inactiveWorkplaces
    .filter((inactiveWorkplace) => {
      return nextEmailTemplate(inactiveWorkplace) !== null;
    })
    .map((inactiveWorkplace) => {
      const { id, name } = nextEmailTemplate(inactiveWorkplace);

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
    });
};

module.exports = {
  findInactiveWorkplaces,
  nextEmailTemplate,
};
