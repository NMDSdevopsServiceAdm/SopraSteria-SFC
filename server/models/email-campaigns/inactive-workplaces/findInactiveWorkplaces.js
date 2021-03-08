const moment = require('moment');

const config = require('../../../config/config');
const models = require('../../index');

const endOfLastMonth = moment().subtract(1, 'months').endOf('month').endOf('day');

const nextEmailTemplate = (inactiveWorkplace) => {
  const lastUpdated = moment(inactiveWorkplace.LastUpdated).endOf('day');

  const sixMonths = endOfLastMonth.clone().subtract(6, 'months');
  const twelveMonths = endOfLastMonth.clone().subtract(12, 'months');
  const eighteenMonths = endOfLastMonth.clone().subtract(18, 'months');
  const twentyFourMonths = endOfLastMonth.clone().subtract(24, 'months');

  if (lastUpdated.isSame(sixMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.sixMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twelveMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twelveMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate ? nextTemplate : null;
  }

  if (lastUpdated.isSame(eighteenMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.eighteenMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate ? nextTemplate : null;
  }

  if (lastUpdated.isSame(twentyFourMonths, 'month')) {
    const nextTemplate = config.get('sendInBlue.templates.twentyFourMonthsInactive');

    return inactiveWorkplace.LastTemplate !== nextTemplate ? nextTemplate : null;
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
					AND ech."createdAt" >= :lastUpdated
					AND ech. "establishmentID" = e. "EstablishmentID");`,
    {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: {
        lastUpdated: endOfLastMonth.clone().subtract(6, 'months').format('YYYY-MM-DD'),
      },
    },
  );

  return inactiveWorkplaces
    .filter((inactiveWorkplace) => {
      return nextEmailTemplate(inactiveWorkplace) !== null;
    })
    .map((inactiveWorkplace) => {
      return {
        id: inactiveWorkplace.EstablishmentID,
        name: inactiveWorkplace.NameValue,
        nmdsId: inactiveWorkplace.NmdsID,
        lastUpdated: inactiveWorkplace.LastUpdated,
        emailTemplateId: nextEmailTemplate(inactiveWorkplace),
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
