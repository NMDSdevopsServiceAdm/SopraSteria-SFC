const moment = require('moment');

const models = require('../../index');

const refreshInactiveWorkplaces = async () => {
  return models.sequelize.query('REFRESH MATERIALIZED VIEW cqc."EstablishmentLastLogin"');
};

const getInactiveWorkplaces = async () => {
  const lastMonth = moment().subtract(1, 'months');

  const lastLogin = lastMonth.clone().subtract(6, 'months').endOf('month').endOf('day').format('YYYY-MM-DD');
  const lastEmailDate = moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');

  return models.sequelize.query(
    `
  SELECT
	"EstablishmentID",
  "NameValue",
  TRIM("NmdsID") AS "NmdsID",
  "DataOwner",
  "PrimaryUserName",
  "PrimaryUserEmail",
	"LastLogin",
  (
		SELECT
			"template"
		FROM
			cqc."EmailCampaignHistories" ech
    JOIN cqc."EmailCampaigns" ec ON ec."id" = ech."emailCampaignID"
		WHERE
      ec."type" = 'inactiveWorkplaces'
		  AND ech. "establishmentID" = e. "EstablishmentID"
      AND ech."createdAt" >= e."LastLogin"
    ORDER BY ech. "createdAt" DESC
    LIMIT 1) AS "LastTemplate"
		FROM
			cqc. "EstablishmentLastLogin" e
		WHERE
      "IsParent" = FALSE
      AND "DataOwner" = 'Workplace'
			AND "LastLogin" <= :lastLogin
      AND "PrimaryUserEmail" IS NOT NULL
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
        lastLogin,
        lastEmailDate,
      },
    },
  );
};

module.exports = {
  getInactiveWorkplaces,
  refreshInactiveWorkplaces,
};
