'use strict';

const db = rfr('server/utils/datastore');

const effectiveDate = rfr('server/models/classes/wdfCalculator').WdfCalculator.effectiveDate.toISOString();

const getEstablishmentDataQuery =
`
SELECT
  e."EstablishmentID",
  "NmdsID",
  "NameValue" AS "SubsidiaryName",
  "DataOwner",
  "DataPermissions",
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
      "Worker"."EstablishmentFK" = e."EstablishmentID"
      and "Archived" = false
  ) AS "TotalIndividualWorkerRecord",
  (
    SELECT
      COUNT(:zero)
    FROM
      cqc."Worker"
    WHERE
      "EstablishmentFK" = e."EstablishmentID" AND
      "LastWdfEligibility" IS NOT NULL AND
      "LastWdfEligibility" > :effectiveDate AND
      "Archived" = :falseFlag
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
    WHERE
      a."EstablishmentID" = e."EstablishmentID"
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
      a."EstablishmentID" = e."EstablishmentID"
  ), :separator) AS "ServiceUsers",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = e."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Vacancies
  ) AS "VacanciesCount",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = e."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Starters
  ) AS "StartersCount",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = e."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Leavers
  ) AS "LeaversCount",
  "VacanciesValue",
  "StartersValue",
  "LeaversValue",
  "NumberOfStaffValue",
  updated,
  CASE WHEN updated > :effectiveDate THEN to_char(updated, :timeFormat) ELSE NULL END "LastUpdatedDate",
  "ShareDataWithCQC",
  "ShareDataWithLA",
  (select count(:zero) from cqc."Worker" where "EstablishmentFK" = e."EstablishmentID") "ReasonsForLeaving",
  "Status",
  array_to_string(array(SELECT "ServiceCapacityID"
  FROM cqc."ServicesCapacity"
  WHERE "ServiceID" = e."MainServiceFKValue"), :separator) "ServicesCapacity",
  array_to_string(array(SELECT "Type"
  FROM cqc."ServicesCapacity"
  WHERE "ServiceID" = e."MainServiceFKValue"), :separator) "Type",
  (SELECT
    b."Answer"
  FROM
    cqc."ServicesCapacity" AS a
  JOIN
    cqc."EstablishmentCapacity" AS b
  ON
    a."ServiceCapacityID" = b."ServiceCapacityID"
  WHERE
    b."EstablishmentID" = e."EstablishmentID" AND
    "ServiceID" = e."MainServiceFKValue" AND a."Type" = :Capacity) "Capacity",
	(SELECT
    b."Answer"
  FROM
    cqc."ServicesCapacity" AS a
  JOIN
    cqc."EstablishmentCapacity" AS b
  ON
    a."ServiceCapacityID" = b."ServiceCapacityID"
  WHERE
    b."EstablishmentID" = e."EstablishmentID" AND
    "ServiceID" = e."MainServiceFKValue" AND a."Type" = :Utilisation) "Utilisation"
FROM
  cqc."Establishment" e
LEFT JOIN
  cqc.services as MainService
ON
  e."MainServiceFKValue" = MainService.id
WHERE
  (e."EstablishmentID" = :establishmentId OR e."ParentID" = :establishmentId) AND
  "Archived" = :falseFlag AND e."Status" IS NULL
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
  "Establishment"."EstablishmentID",
  "DataOwner",
  "DataPermissions",
  "Worker"."GenderValue",
  to_char("DateOfBirthValue", :timeFormat) as "DateOfBirthValue",
  "NationalityValue",
  "Nationality"."Nationality",
  "Job"."JobName" AS "MainJobRole",
  to_char("MainJobStartDateValue", :timeFormat) as "MainJobStartDateValue",
  "RecruitedFromValue",
  "RecruitedFrom"."From",
  "ContractValue",
  "WeeklyHoursContractedValue",
  "WeeklyHoursContractedHours",
  "WeeklyHoursAverageHours",
  "WeeklyHoursAverageValue",
  "ZeroHoursContractValue",
  "DaysSickValue",
  "DaysSickDays",
  "AnnualHourlyPayValue",
  "AnnualHourlyPayRate",
  "CareCertificateValue",
  "QualificationInSocialCareValue",
  "QualificationInSocialCareSavedAt",
  "Qualification"."Level" AS "QualificationInSocialCare",
  "SocialCareQualificationFKValue",
  "SocialCareQualificationFKSavedAt",
  "OtherQualificationsValue",
  "OtherQualificationsSavedAt"
FROM
  cqc."Worker"
INNER JOIN
  cqc."Establishment"
ON
  "Establishment"."EstablishmentID" = "Worker"."EstablishmentFK" AND
  "Establishment"."Archived" = :falseValue AND
  "Establishment"."Status" IS NULL AND
  ("Establishment"."EstablishmentID" = :establishmentId OR "Establishment"."ParentID" = :establishmentId)
LEFT JOIN
  cqc."Job"
ON
  "Worker"."MainJobFKValue" = "Job"."JobID"
LEFT JOIN
  cqc."Qualification"
ON
  "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
LEFT JOIN
  cqc."Nationality"
ON
  cqc."Worker"."NationalityOtherFK" = "Nationality"."ID"
LEFT JOIN
  cqc."RecruitedFrom"
ON
  cqc."Worker"."RecruitedFromOtherFK" = "RecruitedFrom"."ID"
WHERE
  "Worker"."Archived" = :falseValue;
`;

exports.getWorkerData = async establishmentId =>
  db.query(getWorkerDataQuery, {
    replacements: {
      establishmentId,
      separator: ', ',
      falseValue: false,
      timeFormat: 'DD/MM/YYYY'
    },
    type: db.QueryTypes.SELECT
  });
