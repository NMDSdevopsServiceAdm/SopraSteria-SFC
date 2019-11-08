'use strict';

const db = rfr('server/utils/datastore');

const effectiveDate = rfr('server/models/classes/wdfCalculator').WdfCalculator.effectiveDate.toISOString();

const getEstablishmentDataQuery =
`
SELECT
  "Establishment"."EstablishmentID",
  "NmdsID",
  "NameValue" AS "SubsidiaryName",
  "EmployerTypeValue",
  "EmployerTypeSavedAt",
  CASE WHEN "OverallWdfEligibility" > :effectiveDate THEN "OverallWdfEligibility" ELSE NULL END AS "CurrentWdfEligibilityStatus",
  CASE WHEN "OverallWdfEligibility" > :effectiveDate THEN to_char("OverallWdfEligibility", :timeFormat) ELSE NULL END AS "DateEligibilityAchieved",
  MainService.name AS "MainService",
  "MainServiceFKValue",
  (
    SELECT
      COUNT(:zero)
    FROM
      cqc."Worker"
    WHERE
      "Worker"."EstablishmentFK" = "Establishment"."EstablishmentID"
  ) AS "TotalIndividualWorkerRecord",
  (
    SELECT
      COUNT(:zero)
    FROM
      cqc."Worker"
    WHERE
      "EstablishmentFK" = "Establishment"."EstablishmentID" AND
      "LastWdfEligibility" IS NOT NULL AND
      "LastWdfEligibility" > :effectiveDate
  ) AS "CompletedWorkerRecords",
  array_to_string(array(
    SELECT
      b."name"
    FROM
      cqc."EstablishmentServices" AS a
    JOIN
      cqc."services" AS b
    ON
      a."ServiceID" = b.id
    JOIN
      cqc."Establishment" AS c
    ON
      a."EstablishmentID" = c."EstablishmentID"
    WHERE
      c."EstablishmentID" = "Establishment"."EstablishmentID"
  ), :separator) AS "OtherServices",
  array_to_string(array(
    SELECT
      b."ServiceGroup"
    FROM
      cqc."EstablishmentServiceUsers" AS a
    JOIN
      cqc."ServiceUsers" AS b
    ON
      a."ServiceUserID" = b."ID"
    WHERE
      a."EstablishmentID" = "Establishment"."EstablishmentID"
  ), :separator) AS "ServiceUsers",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Vacancies
  ) AS "VacanciesValue",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Starters
  ) AS "StartersValue",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Leavers
  ) AS "LeaversValue",
  (
    SELECT
      a."Answer"
    FROM
      cqc."EstablishmentCapacity" AS a
    JOIN
      cqc."ServicesCapacity" AS b
    ON
      a."ServiceCapacityID" = b."ServiceCapacityID"
    JOIN
      cqc."Establishment" c
    ON
      a."EstablishmentID" = c."EstablishmentID"
    WHERE
      a."EstablishmentID" = "Establishment"."EstablishmentID" AND
      c."MainServiceFKValue" = b."ServiceID" AND
      b."Type" = :Capacity
  ) AS  "Capacities",
  (
    SELECT
      a."Answer"
    FROM
      cqc."EstablishmentCapacity" a
    JOIN
      cqc."ServicesCapacity" b
    ON
      a."ServiceCapacityID" = b."ServiceCapacityID"
    JOIN
      cqc."Establishment" c
    ON
      a."EstablishmentID" = c."EstablishmentID"
    WHERE
      a."EstablishmentID" = "Establishment"."EstablishmentID" AND
      c."MainServiceFKValue" = b."ServiceID" AND
      b."Type" = :Utilisation
  ) AS "Utilisations",
  "NumberOfStaffValue",
  updated,
  CASE WHEN updated > :effectiveDate THEN to_char(updated, :timeFormat) ELSE NULL END AS "LastUpdatedDate",
  "ShareDataWithCQC",
  "ShareDataWithLA",
  "ReasonsForLeaving"
FROM
  cqc."Establishment"
LEFT JOIN
  cqc.services as MainService
ON
  "Establishment"."MainServiceFKValue" = MainService.id
WHERE
  ("Establishment"."EstablishmentID" = :establishmentId OR "Establishment"."ParentID" = :establishmentId) AND
  "Archived" = :falseFlag
ORDER BY
  "EstablishmentID";
`;

exports.getEstablishmentData = async establishmentId =>
  db.query(getEstablishmentDataQuery, {
    replacements: {
      zero: 0,
      falseFlag: false,
      timeFormat: 'DD/MM/YYYY',
      establishmentId,
      separator: ', ',
      effectiveDate,
      Vacancies: 'Vacancies',
      Starters: 'Starters',
      Leavers: 'Leavers',
      Capacity: 'Capacity',
      Utilisation: 'Utilisation'
    },
    type: db.QueryTypes.SELECT
  });

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
  array_to_string(array(
    SELECT
      b."From"
    FROM
      cqc."Worker" AS a
    JOIN
      cqc."Qualifications" AS b
    ON
      a."HighestQualificationFKValue" = b."ID"
    WHERE
      "EstablishmentFK" = "Establishment"."EstablishmentID"
  ), :separator) AS "HighestQualificationHeld"
FROM
  cqc."Worker"
INNER JOIN
  cqc."Establishment"
ON
  "Establishment"."EstablishmentID" = "Worker"."EstablishmentFK" AND
  "Establishment"."Archived" = :falseValue AND
  ("Establishment"."EstablishmentID" = :establishmentId OR "Establishment"."ParentID" = :establishmentId)
LEFT JOIN
  cqc."Job"
ON
  "Worker"."MainJobFKValue" = "Job"."JobID"
LEFT JOIN
  cqc."Qualification"
ON
  "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
WHERE
  "Worker"."Archived" = :falseValue;
`;

exports.getWorkerData = async establishmentId =>
  db.query(getWorkerDataQuery, {
    replacements: {
      establishmentId,
      separator: ', ',
      falseValue: false
    },
    type: db.QueryTypes.SELECT
  });
