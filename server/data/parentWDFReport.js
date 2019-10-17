'use strict';

const db = rfr('server/utils/datastore');

const getEstablishmentDataQuery =
`
SELECT
		"Establishment"."EstablishmentID",
		"NmdsID",
		"NameValue" AS "SubsidiaryName",
		"EmployerTypeValue",
    "EmployerTypeSavedAt",
    "CurrentWdfEligibiity" AS "CurrentWdfEligibilityStatus",
    to_char("EstablishmentWdfEligibility", :timeFormat) AS "DateEligibilityAchieved",
		MainService.name AS "MainService",
		"MainServiceFKValue",
    (select count(:zero) from cqc."Worker" where "Worker"."EstablishmentFK" = "Establishment"."EstablishmentID") AS "TotalIndividualWorkerRecord",
    (SELECT COUNT(:zero) FROM cqc."Worker" WHERE "EstablishmentFK" = "Establishment"."EstablishmentID"
    AND "CompletedSavedAt" IS NOT NULL AND EXTRACT(YEAR FROM "CompletedSavedAt") = :currentYear) AS "CompletedWorkerRecords",
    array_to_string(array(SELECT b."name" FROM cqc."EstablishmentServices" a
    JOIN cqc."services" b ON a."ServiceID" = b.id
    JOIN cqc."Establishment" c ON a."EstablishmentID" = c."EstablishmentID"
    WHERE c."EstablishmentID" = "Establishment"."EstablishmentID"), :sepaerator) AS "OtherServices",
    array_to_string(array(SELECT b."ServiceGroup" FROM cqc."EstablishmentServiceUsers" a JOIN cqc."ServiceUsers" b
    ON a."ServiceUserID" = b."ID" WHERE a."EstablishmentID" = "Establishment"."EstablishmentID"), :sepaerator) AS "ServiceUsers",
    (select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = :Vacancies) AS "VacanciesValue",
		(select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = :Starters) AS "StartersValue",
		(select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = :Leavers) AS "LeaversValue",
		(SELECT a."Answer"
    FROM cqc."EstablishmentCapacity" a
    JOIN cqc."ServicesCapacity" b ON a."ServiceCapacityID" = b."ServiceCapacityID"
    JOIN cqc."Establishment" c ON a."EstablishmentID" = c."EstablishmentID"
    where a."EstablishmentID" = "Establishment"."EstablishmentID" AND c."MainServiceFKValue" = b."ServiceID"
    AND b."Type" = :Capacity) AS  "Capacities",
		(SELECT a."Answer"
    FROM cqc."EstablishmentCapacity" a
    JOIN cqc."ServicesCapacity" b ON a."ServiceCapacityID" = b."ServiceCapacityID"
    JOIN cqc."Establishment" c ON a."EstablishmentID" = c."EstablishmentID"
    where a."EstablishmentID" = "Establishment"."EstablishmentID" AND c."MainServiceFKValue" = b."ServiceID"
    AND b."Type" = :Utilisation) AS "Utilisations",
		"NumberOfStaffValue",
		updated,
		to_char(updated, :timeFormat) AS "LastUpdatedDate",
    "ShareDataWithCQC",
    "ShareDataWithLA",
    "ReasonsForLeaving"
FROM
    cqc."Establishment"
	  LEFT JOIN cqc.services as MainService on "Establishment"."MainServiceFKValue" = MainService.id
		LEFT JOIN cqc."EstablishmentMainServicesWithCapacitiesVW" on "EstablishmentMainServicesWithCapacitiesVW"."EstablishmentID" = "Establishment"."EstablishmentID"
WHERE
		("Establishment"."EstablishmentID" = :estID OR "Establishment"."ParentID" = :estID) AND
		"Archived" = :falseFlag
ORDER BY
		"EstablishmentID";
`;

const getWorkerDataQuery =
`
SELECT
    "Worker"."NameOrIdValue",
    "Establishment"."NameValue",
		"Worker"."GenderValue",
		"Worker"."DateOfBirthValue",
		"NationalityValue",
    "Job"."JobName" AS "MainJobRole",
    "MainJobStartDateValue",
    "RecruitedFromValue",
    "ContractValue",
    "WeeklyHoursContractedValue",
    "ZeroHoursContractValue",
    "DaysSickValue",
    "AnnualHourlyPayValue",
    "AnnualHourlyPayRate",
    "CareCertificateValue",
    array_to_string(array(SELECT b."From" FROM cqc."Worker" a
    JOIN cqc."Qualifications" b ON a."HighestQualificationFKValue"  = b."ID"
    WHERE "EstablishmentFK" = "Establishment"."EstablishmentID"), :seperator) AS "HighestQualificationHeld"
	FROM cqc."Worker"
		INNER JOIN cqc."Establishment" on "Establishment"."EstablishmentID" = "Worker"."EstablishmentFK" AND "Establishment"."Archived" = :falseValue AND ("Establishment"."EstablishmentID" = :estID OR "Establishment"."ParentID" = :estID)
		LEFT JOIN cqc."Job" on "Worker"."MainJobFKValue" = "Job"."JobID"
		LEFT JOIN cqc."Qualification" on "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
	WHERE
		"Worker"."Archived" = :falseValue;
`

exports.getEstablishmentData = async(params) =>
  db.query(getEstablishmentDataQuery, {
    replacements: {
      zero: 0,
      falseFlag: false,
      timeFormat: 'DD/MM/YYYY',
      estID: params.establishmentId,
      sepaerator: ', ',
      currentYear: new Date().getFullYear(),
      Vacancies: 'Vacancies',
      Starters: 'Starters',
      Leavers: 'Leavers',
      Capacity: 'Capacity',
      Utilisation: 'Utilisation'
    },
    type: db.QueryTypes.SELECT
  })

exports.getWorkerData = async(params) =>
  db.query(getWorkerDataQuery, {
    replacements: {
      estID: params.establishmentId,
      seperator: ', ',
      falseValue: false
    },
    type: db.QueryTypes.SELECT
  })
