'use strict';

const { sequelize } = require('../server/models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE VIEW cqc."ChildWorkplaces" AS

			SELECT DISTINCT ON(e."EstablishmentID") e."EstablishmentID", e."NameValue", e."ParentID",
        (
        	CASE
        	-- Number of staff is null
        	WHEN e."NumberOfStaffValue" IS NULL THEN true
        	-- No vacancy data
        	WHEN e."VacanciesValue" IS NULL THEN true
        	-- Number of staff does not equal worker count
        	WHEN (
        		SELECT (COUNT(w."ID") != e."NumberOfStaffValue")
        		FROM cqc."Worker" w
        		WHERE w."EstablishmentFK" = e."EstablishmentID"
				AND w."Archived" = false
        	) THEN true

        	WHEN (
        		SELECT w."ID"
        		FROM cqc."Worker" w
        		WHERE w."EstablishmentFK" = e."EstablishmentID"
				AND w."Archived" = false
        		AND (
				-- Workers not completed
					(
						w."CompletedValue" = false
        				AND ('now'::timestamp - '1 month'::interval) > w."created"
					)
				-- International recruitment data required
					OR (
						w."HealthAndCareVisaValue" IS NULL
				   		AND ((w."NationalityValue" = 'Other' AND w."BritishCitizenshipValue" IN ('No', 'Don''t know', NULL))
        				OR (w."NationalityValue" = 'Don''t know' AND w."BritishCitizenshipValue" = 'No'))
					)
				)
        		LIMIT 1
        	) IS NOT NULL THEN true
			-- No training has been added
			WHEN (
				SELECT w."ID"
				FROM cqc."WorkerTraining" wt
        		JOIN cqc."Worker" w ON wt."WorkerFK" = w."ID"
				WHERE w."EstablishmentFK" = e."EstablishmentID"
				AND w."Archived" = false
				LIMIT 1
			) IS NULL THEN true
        	-- Training is expired or expires soon
        	WHEN (
        		SELECT w."ID"
        		FROM cqc."WorkerTraining" wt
        		JOIN cqc."Worker" w ON wt."WorkerFK" = w."ID"
        		WHERE wt."Expires" <= ('now'::timestamp + '90 days'::interval) -- wt."Expires" < CURRENT_DATE
        		AND w."EstablishmentFK" = e."EstablishmentID"
        		LIMIT 1
        	) IS NOT NULL THEN true
        	-- Mandatory training is missing
        	WHEN (
                SELECT mt."ID"
                  FROM cqc."MandatoryTraining" mt
        		  JOIN cqc."Worker" w
        		  	ON mt."JobFK" = w."MainJobFKValue"
                  WHERE mt."TrainingCategoryFK" NOT IN (
                    SELECT
                      DISTINCT "CategoryFK"
                    FROM cqc."WorkerTraining" wt
        			WHERE wt."WorkerFK" = w."ID"
               		)
        		AND mt."EstablishmentFK" = e."EstablishmentID"
				AND w."EstablishmentFK" = e."EstablishmentID"
				AND w."Archived" = false
        		LIMIT 1
        	   ) IS NOT NULL THEN true
        	   ELSE false
        	 END
        ) AS "ShowFlag"
        FROM cqc."Establishment" e
				WHERE e."ParentID" IS NOT NULL
      `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP VIEW cqc."ChildWorkplaces"`);
  }
};
