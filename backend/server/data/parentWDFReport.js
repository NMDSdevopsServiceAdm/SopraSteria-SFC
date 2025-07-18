'use strict';

const db = require('../utils/datastore');

const effectiveDate = require('../models/classes/wdfCalculator').WdfCalculator.effectiveDate.toISOString();

const getEstablishmentDataQuery = `
SELECT
  "Establishment"."EstablishmentID",
  "NmdsID",
  "NameValue" AS "SubsidiaryName",
  "DataOwner",
  "DataPermissions",
  "EmployerTypeValue",
  "EmployerTypeSavedAt",
  CASE WHEN "OverallWdfEligibility" > :effectiveDate THEN true ELSE NULL END AS "CurrentWdfEligibilityStatus",
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
      and "Archived" = false
  ) AS "TotalIndividualWorkerRecord",
  (
    SELECT
      COUNT(:zero)
    FROM
      cqc."Worker"
      LEFT JOIN
        cqc."Job"
      ON
        "Worker"."MainJobFKValue" = "Job"."JobID"
    LEFT JOIN
        cqc."Nationality"
      ON
        cqc."Worker"."NationalityOtherFK" = "Nationality"."ID"
	  LEFT JOIN
        cqc."Qualification"
      ON
        "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
    WHERE
      "EstablishmentFK" = "Establishment"."EstablishmentID" AND
      ("GenderValue" IS NOT NULL)  AND
      ("DateOfBirthValue" IS NOT NULL)  AND
      (("NationalityValue" = :British OR "NationalityValue" = :Dont) OR ("NationalityValue" = :Other)) AND
      ("Job"."JobName" IS NOT NULL OR "Job"."JobName" != :emptyValue)  AND
      ("MainJobStartDateValue" IS NOT NULL)  AND
      ("RecruitedFromValue" IS NOT NULL)  AND
      ("ContractValue" IS NOT NULL)  AND
      ("WeeklyHoursContractedValue" IS NOT NULL OR "WeeklyHoursAverageValue" IS NOT NULL) AND
      ("ZeroHoursContractValue" IS NOT NULL) AND
      ("DaysSickValue" IS NOT NULL OR ( "ContractValue" <> :perm OR "ContractValue" <> :temp )) AND
      (("AnnualHourlyPayValue" IS NOT NULL AND ("AnnualHourlyPayRate" IS NOT NULL OR "AnnualHourlyPayValue" = :Dont))) AND
      ("CareCertificateValue" IS NOT NULL) AND
      ("QualificationInSocialCareValue" IS NOT NULL AND ("QualificationInSocialCareValue" = :No OR "QualificationInSocialCareValue" = :Dont) OR ("Qualification"."Level" IS NOT NULL OR "Qualification"."Level" != :emptyValue))  AND
      ("OtherQualificationsValue" IS NOT NULL) AND
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
  ) AS "VacanciesCount",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Starters
  ) AS "StartersCount",
  (
    SELECT
      SUM("Total")
    FROM
      cqc."EstablishmentJobs"
    WHERE
      "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND
      "EstablishmentJobs"."JobType" = :Leavers
  ) AS "LeaversCount",
  "VacanciesValue",
  "StartersValue",
  "LeaversValue",
  "NumberOfStaffValue",
  to_char(updated, :timeFormat) updated,
  CASE WHEN updated > :effectiveDate THEN true ELSE NULL END AS "LastUpdatedDate",
  "ShareDataWithCQC",
  "ShareDataWithLA",
  (select count("LeaveReasonFK") from cqc."Worker" where "EstablishmentFK" = "Establishment"."EstablishmentID") as "ReasonsForLeaving",
  "Status"
FROM
  cqc."Establishment"
LEFT JOIN
  cqc.services as MainService
ON
  "Establishment"."MainServiceFKValue" = MainService.id
WHERE
  ("Establishment"."EstablishmentID" = :establishmentId OR "Establishment"."ParentID" = :establishmentId) AND
   (("Establishment"."IsParent" = true) OR ("Establishment"."DataOwner" = :Parent OR "Establishment"."DataPermissions" = :WorkplaceStaff)) AND
  "Archived" = :falseFlag
ORDER BY
  "EstablishmentID";
`;

const getCapicityOrUtilisationDataQuery = `SELECT
    b."Answer"
  FROM
    cqc."ServicesCapacity" AS a
  JOIN
    cqc."EstablishmentCapacity" AS b
  ON
    a."ServiceCapacityID" = b."ServiceCapacityID"
  WHERE
    b."EstablishmentID" = :establishmentId AND
    "ServiceID" = :mainServiceId AND
    a."Type" = :type`;

const getServiceCapacityDetailsQuery = `SELECT "ServiceCapacityID", "Type"
   FROM cqc."ServicesCapacity"
   WHERE "ServiceID" = :mainServiceId`;

exports.getEstablishmentData = async (establishmentId) =>
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
      Dont: "Don't know",
      Other: 'Other',
      No: 'No',
      perm: 'Permanent',
      temp: 'Temporary',
      emptyValue: '',
      WorkplaceStaff: 'Workplace and Staff',
      Parent: 'Parent',
      British: 'British',
    },
    type: db.QueryTypes.SELECT,
  });

exports.getCapicityData = async (establishmentId, mainServiceId) =>
  db.query(getCapicityOrUtilisationDataQuery, {
    replacements: {
      establishmentId,
      mainServiceId,
      type: 'Capacity',
    },
    type: db.QueryTypes.SELECT,
  });

exports.getUtilisationData = async (establishmentId, mainServiceId) =>
  db.query(getCapicityOrUtilisationDataQuery, {
    replacements: {
      establishmentId,
      mainServiceId,
      type: 'Utilisation',
    },
    type: db.QueryTypes.SELECT,
  });

exports.getServiceCapacityDetails = async (mainServiceId) =>
  db.query(getServiceCapacityDetailsQuery, {
    replacements: {
      mainServiceId,
    },
    type: db.QueryTypes.SELECT,
  });

const getWorkerDataQuery = `
SELECT
  "Worker"."NameOrIdValue",
  "Establishment"."NameValue",
  "Establishment"."EstablishmentID",
  "DataOwner",
  "DataPermissions",
  "Worker"."GenderValue",
  to_char("DateOfBirthValue", :timeFormat) AS "DateOfBirthValue",
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
  "OtherQualificationsSavedAt",
  "Worker"."WdfEligible",
  "Worker"."LastWdfEligibility"
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

exports.getWorkerData = async (establishmentId) =>
  db.query(getWorkerDataQuery, {
    replacements: {
      establishmentId,
      separator: ', ',
      falseValue: false,
      timeFormat: 'DD/MM/YYYY',
    },
    type: db.QueryTypes.SELECT,
  });
