'use strict';

const db = rfr('server/utils/datastore');


const getEstablishmentDataQuery =
`
SELECT
		"Establishment"."EstablishmentID",
		"NmdsID",
		"NameValue",
		"EmployerTypeValue",
    "EmployerTypeSavedAt",
    "CurrentWdfEligibiity",
		"EstablishmentWdfEligibility",
		MainService.name AS "MainService",
		"MainServiceFKValue",
		(select count(:zero) from cqc."EstablishmentServiceUsers" where "EstablishmentServiceUsers"."EstablishmentID" = "Establishment"."EstablishmentID") AS "ServiceUsersCount",
		"ServiceUsersSavedAt",
		"VacanciesValue",
		(select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = :vacancies) AS "Vacancies",
		"VacanciesSavedAt",
		"StartersValue",
		(select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = :starters) AS "Starters",
		"StartersSavedAt",
		"LeaversValue",
		(select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = 'leavers') AS "Leavers",
		"LeaversSavedAt",
		"NumberOfStaffValue",
		"EstablishmentMainServicesWithCapacitiesVW"."CAPACITY" AS "Capacities",
		"EstablishmentMainServicesWithCapacitiesVW"."UTILISATION" AS "Utilisations",
		"NumberOfStaffValue",
		updated,
		to_char(updated, :timeFormat) AS lastupdateddate,
    "NumberOfIndividualStaffRecords",
    "NumberOfStaffRecordsCompleted"
    FROM
      cqc."Establishment"
	  	LEFT JOIN cqc.services as MainService on "Establishment"."MainServiceFKValue" = MainService.id
		LEFT JOIN cqc."EstablishmentMainServicesWithCapacitiesVW" on "EstablishmentMainServicesWithCapacitiesVW"."EstablishmentID" = "Establishment"."EstablishmentID"
		LEFT JOIN (
			SELECT
				"EstablishmentFK",
				"WorkplaceFK",
        count("ParentWDFReportWorker"."WorkerFK") AS "NumberOfIndividualStaffRecords",
        count("ParentWDFReportWorker"."WorkerFK") FILTER (WHERE "ParentWDFReportWorker"."StaffRecordComplete" = :flag) AS "NumberOfStaffRecordsCompleted"
			FROM cqc."ParentWDFReportWorker"
			WHERE
				"ParentWDFReportWorker"."EstablishmentFK" = :estID
			GROUP BY
				"EstablishmentFK", "WorkplaceFK"
		) "EstablishmentWorkers" ON "EstablishmentWorkers"."WorkplaceFK" = "Establishment"."EstablishmentID"
    WHERE
		("Establishment"."EstablishmentID" = :estID OR "Establishment"."ParentID" = :estID) AND
		"Archived" = :falseFlag
	ORDER BY
		"EstablishmentID";
`;

exports.getEstablishmentData = async(params) =>
  db.query(getEstablishmentDataQuery, {
    replacements: {
      zero: 0,
      vacancies: 'Vacancies',
      starters: 'Starters',
      leavers: 'Leavers',
      flag: true,
      timeFormat: 'DD/MM/YYYY',
      estID: params.establishmentId
    },
    type: db.QueryTypes.SELECT
  })
