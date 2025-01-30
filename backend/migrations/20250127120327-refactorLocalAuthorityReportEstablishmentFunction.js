'use strict';

const refactoredFunctionDefinition = `
CREATE OR REPLACE FUNCTION cqc.localauthorityreportestablishment(establishmentid integer, reportfrom date, reportto date) RETURNS boolean
LANGUAGE plpgsql

AS $BODY$
DECLARE
success BOOLEAN;
v_error_msg TEXT;
v_error_stack TEXT;
BEGIN
  success := true;

  RAISE NOTICE 'localAuthorityReportEstablishment (%) from % to %, time: %', establishmentID, reportFrom, reportTo, timeofday();

    INSERT INTO cqc."LocalAuthorityReportEstablishment" (
    "ReportFrom",
    "ReportTo",
    "EstablishmentFK",
    "WorkplaceFK",
    "WorkplaceName",
    "WorkplaceID",
    "LastUpdatedDate",
    "EstablishmentType",
    "MainService",
    "ServiceUserGroups",
    "CapacityOfMainService",
    "UtilisationOfMainService",
    "NumberOfVacancies",
    "NumberOfStarters",
    "NumberOfLeavers",
    "NumberOfStaffRecords",
    "WorkplaceComplete",
    "NumberOfIndividualStaffRecords",
    "PercentageOfStaffRecords",
    "NumberOfStaffRecordsNotAgency",
    "NumberOfCompleteStaffNotAgency",
    "PercentageOfCompleteStaffRecords",
    "NumberOfAgencyStaffRecords",
    "NumberOfCompleteAgencyStaffRecords",
    "PercentageOfCompleteAgencyStaffRecords"
) SELECT
    reportFrom,
    reportTo,
    establishmentID,
    e."EstablishmentID",
    e."NameValue",
    e."NmdsID",
    e.updated::DATE,
    CASE WHEN e."EmployerTypeValue" IS NOT NULL THEN e."EmployerTypeValue"::TEXT ELSE 'Missing' END AS "EstablishmentType",
    e."MainService",
    CASE
        WHEN e."MainServiceFKValue" = 16 THEN 'n/a'
        WHEN e."MainServiceFKValue" <> 16 AND serviceuserscount > 0 THEN 'Completed'
        ELSE 'Missing'
    END AS "ServiceUserGroups",
    CASE
        WHEN e."Capacities" = -1 THEN 'Missing'
        WHEN e."Capacities" IS NULL THEN 'n/a'
        ELSE e."Capacities"::TEXT
    END AS "CapacityOfMainService",
    CASE
        WHEN e."Utilisations" = -1 THEN 'Missing'
        WHEN e."Utilisations" IS NULL THEN 'n/a'
        ELSE e."Utilisations"::TEXT
    END AS "UtilisationOfMainService",
    CASE
        WHEN e."VacanciesValue" = 'With Jobs' THEN e."Vacancies"::TEXT
        WHEN e."VacanciesValue" IS NULL THEN 'Missing'
        ELSE '0'
    END AS "NumberOfVacancies",
    CASE
        WHEN e."StartersValue" = 'With Jobs' THEN e."Starters"::TEXT
        WHEN e."StartersValue" IS NULL THEN 'Missing'
        ELSE '0'
    END AS "NumberOfStarters",
    CASE
        WHEN e."LeaversValue" = 'With Jobs' THEN e."Leavers"::TEXT
        WHEN e."LeaversValue" IS NULL THEN 'Missing'
        ELSE '0'
    END AS "NumberOfLeavers",
    CASE
        WHEN e."NumberOfStaffValue" IS NOT NULL THEN e."NumberOfStaffValue"::TEXT
        ELSE 'Missing'
    END AS "NumberOfStaffRecords",
    CASE
        WHEN e.updated::DATE < reportFrom THEN false
        WHEN SUBSTRING(e."EmployerTypeValue"::TEXT FROM 1 FOR 15) <> 'Local Authority' THEN false
        WHEN (CASE
                    WHEN e."MainServiceFKValue" = 16 THEN 'n/a'
                    WHEN e."MainServiceFKValue" <> 16 AND serviceuserscount > 0 THEN 'Completed'
                    ELSE 'Missing'
                END) = 'Missing' THEN false
        WHEN e."Capacities" = -1 THEN false
        WHEN e."Utilisations" = -1 THEN false
        WHEN e."NumberOfStaffValue" IS NULL THEN false
        WHEN e."VacanciesValue" IS NULL THEN false
        WHEN e."StartersValue" IS NULL THEN false
        WHEN e."LeaversValue" IS NULL THEN false
        ELSE true
    END AS "WorkplaceComplete",
    e."NumberOfIndividualStaffRecords" AS "NumberOfIndividualStaffRecords",
    CASE
        WHEN e."NumberOfStaffValue" IS NOT NULL AND e."NumberOfStaffValue" > 0 THEN
            (e."NumberOfIndividualStaffRecords"::NUMERIC / e."NumberOfStaffValue") * 100.0
        ELSE 0.0
    END AS "PercentageOfStaffRecords",
    e."NumberOfStaffRecordsNotAgency",
    e."NumberOfStaffRecordsNotAgencyCompleted",
    CASE
        WHEN e."NumberOfStaffRecordsNotAgency" > 0 THEN
            (e."NumberOfStaffRecordsNotAgencyCompleted"::NUMERIC / e."NumberOfStaffRecordsNotAgency") * 100.0
        ELSE 0.0
    END AS "PercentageOfCompleteStaffRecords",
    e."NumberOfAgencyStaffRecords",
    e."NumberOfAgencyStaffRecordsCompleted",
    CASE
        WHEN e."NumberOfAgencyStaffRecords" > 0 THEN
            (e."NumberOfAgencyStaffRecordsCompleted"::NUMERIC / e."NumberOfAgencyStaffRecords") * 100.0
        ELSE 0.0
    END AS "PercentageOfCompleteAgencyStaffRecords"
FROM (
        SELECT
            est."EstablishmentID",
            est."NameValue",
            est."NmdsID",
            est."EmployerTypeValue",
            svc.name AS "MainService",
            est."MainServiceFKValue",
            est.updated,
            est."ParentID",
            est."Archived",
            (SELECT COUNT(*) FROM cqc."EstablishmentServiceUsers" WHERE "EstablishmentID" = est."EstablishmentID") AS serviceuserscount,
            "EstablishmentMainServicesWithCapacitiesVW"."CAPACITY" AS "Capacities",
            "EstablishmentMainServicesWithCapacitiesVW"."UTILISATION" AS "Utilisations",
            est."VacanciesValue",
            (SELECT SUM("Total") FROM cqc."EstablishmentJobs" WHERE "EstablishmentID" = est."EstablishmentID" AND "JobType" = 'Vacancies') AS "Vacancies",
            est."StartersValue",
            (SELECT SUM("Total") FROM cqc."EstablishmentJobs" WHERE "EstablishmentID" = est."EstablishmentID" AND "JobType" = 'Starters') AS "Starters",
            est."LeaversValue",
            (SELECT SUM("Total") FROM cqc."EstablishmentJobs" WHERE "EstablishmentID" = est."EstablishmentID" AND "JobType" = 'Leavers') AS "Leavers",
            est."NumberOfStaffValue",
            COALESCE(w."NumberOfIndividualStaffRecords", 0) AS "NumberOfIndividualStaffRecords",
            COALESCE(w."NumberOfStaffRecordsNotAgency", 0) AS "NumberOfStaffRecordsNotAgency",
            COALESCE(w."NumberOfStaffRecordsNotAgencyCompleted", 0) AS "NumberOfStaffRecordsNotAgencyCompleted",
            COALESCE(w."NumberOfAgencyStaffRecords", 0) AS "NumberOfAgencyStaffRecords",
            COALESCE(w."NumberOfAgencyStaffRecordsCompleted", 0) AS "NumberOfAgencyStaffRecordsCompleted"
        FROM cqc."Establishment" est
        LEFT JOIN cqc.services svc ON est."MainServiceFKValue" = svc.id
        LEFT JOIN cqc."EstablishmentMainServicesWithCapacitiesVW" on "EstablishmentMainServicesWithCapacitiesVW"."EstablishmentID" = est."EstablishmentID"
        LEFT JOIN (
            SELECT
                lw."EstablishmentFK",
                lw."WorkplaceFK",
                COUNT(lw."WorkerFK") AS "NumberOfIndividualStaffRecords",
                COUNT(lw."WorkerFK") FILTER (WHERE lw."EmploymentStatus" NOT IN ('Agency')) AS "NumberOfStaffRecordsNotAgency",
                COUNT(lw."WorkerFK") FILTER (WHERE lw."EmploymentStatus" NOT IN ('Agency') AND lw."StaffRecordComplete" = true) AS "NumberOfStaffRecordsNotAgencyCompleted",
                COUNT(lw."WorkerFK") FILTER (WHERE lw."EmploymentStatus" IN ('Agency')) AS "NumberOfAgencyStaffRecords",
                COUNT(lw."WorkerFK") FILTER (WHERE lw."EmploymentStatus" IN ('Agency') AND lw."StaffRecordComplete" = true) AS "NumberOfAgencyStaffRecordsCompleted"
            FROM cqc."LocalAuthorityReportWorker" lw
            WHERE lw."EstablishmentFK" = establishmentID
            GROUP BY lw."EstablishmentFK", lw."WorkplaceFK"
        ) w ON w."WorkplaceFK" = est."EstablishmentID"
        ) e
        WHERE (e."EstablishmentID" = establishmentID OR e."ParentID" = establishmentID)
            AND e."Archived" = false;

  RETURN success;

  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_stack=PG_EXCEPTION_CONTEXT, v_error_msg=MESSAGE_TEXT;
    RAISE WARNING 'localAuthorityReportEstablishment: %: %', v_error_msg, v_error_stack;
    RETURN false;

END;
$BODY$;`;

const originalFunctionDefinition = `
CREATE OR REPLACE FUNCTION cqc.localauthorityreportestablishment(establishmentid integer, reportfrom date, reportto date) RETURNS boolean
  LANGUAGE plpgsql
  AS $BODY$


DECLARE
success BOOLEAN;
v_error_msg TEXT;
v_error_stack TEXT;
AllEstablishments REFCURSOR;
CurrentEstablishment RECORD;
CalculatedEmployerType TEXT;
CalculatedServiceUserGroups TEXT;
CalculatedCapacity TEXT;
CalculatedUtilisation TEXT;
CalculatedVacancies TEXT;
CalculatedStarters TEXT;
CalculatedLeavers TEXT;
CalculatedNumberOfStaff TEXT;
CalculatedNumberOfStaffInt INTEGER;
CalculatedWorkplaceComplete BOOLEAN;
BEGIN
success := true;

RAISE NOTICE 'localAuthorityReportEstablishment (%) from % to %', establishmentID, reportFrom, reportTo;

OPEN AllEstablishments FOR
SELECT
  "Establishment"."EstablishmentID",
  "NmdsID",
  "NameValue",
  "EmployerTypeValue",
  "EmployerTypeSavedAt",
  MainService.name AS "MainService",
  "MainServiceFKValue",
  "MainServiceFKSavedAt",
  (select count(0) from cqc."EstablishmentServiceUsers" where "EstablishmentServiceUsers"."EstablishmentID" = "Establishment"."EstablishmentID") AS "ServiceUsersCount",
  "ServiceUsersSavedAt",
  "VacanciesValue",
  (select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = 'Vacancies') AS "Vacancies",
  "VacanciesSavedAt",
  "StartersValue",
  (select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = 'Starters') AS "Starters",
  "StartersSavedAt",
  "LeaversValue",
  (select sum("Total") from cqc."EstablishmentJobs" where "EstablishmentJobs"."EstablishmentID" = "Establishment"."EstablishmentID" AND "EstablishmentJobs"."JobType" = 'Leavers') AS "Leavers",
  "LeaversSavedAt",
  "NumberOfStaffValue",
  "NumberOfStaffSavedAt",
  "EstablishmentMainServicesWithCapacitiesVW"."CAPACITY" AS "Capacities",
  "EstablishmentMainServicesWithCapacitiesVW"."UTILISATION" AS "Utilisations",
  "CapacityServicesSavedAt",
  "NumberOfStaffValue",
  "NumberOfStaffSavedAt",
  updated,
  to_char(updated, 'DD/MM/YYYY') AS lastupdateddate,
  "NumberOfIndividualStaffRecords",
  "NumberOfStaffRecordsNotAgency",
  "NumberOfAgencyStaffRecords",
  "NumberOfStaffRecordsNotAgencyCompleted",
  "NumberOfAgencyStaffRecordsCompleted"
  FROM
    cqc."Establishment"
    LEFT JOIN cqc.services as MainService on "Establishment"."MainServiceFKValue" = MainService.id
  LEFT JOIN cqc."EstablishmentMainServicesWithCapacitiesVW" on "EstablishmentMainServicesWithCapacitiesVW"."EstablishmentID" = "Establishment"."EstablishmentID"
  LEFT JOIN (
    SELECT
      "EstablishmentFK",
      "WorkplaceFK",
      count("LocalAuthorityReportWorker"."WorkerFK") AS "NumberOfIndividualStaffRecords",
      count("LocalAuthorityReportWorker"."WorkerFK") FILTER (WHERE "LocalAuthorityReportWorker"."EmploymentStatus" not in ('Agency')) AS "NumberOfStaffRecordsNotAgency",
      count("LocalAuthorityReportWorker"."WorkerFK") FILTER (WHERE "LocalAuthorityReportWorker"."EmploymentStatus" not in ('Agency') AND "LocalAuthorityReportWorker"."StaffRecordComplete" = true) AS "NumberOfStaffRecordsNotAgencyCompleted",
      count("LocalAuthorityReportWorker"."WorkerFK") FILTER (WHERE "LocalAuthorityReportWorker"."EmploymentStatus" in ('Agency')) AS "NumberOfAgencyStaffRecords",
      count("LocalAuthorityReportWorker"."WorkerFK") FILTER (WHERE "LocalAuthorityReportWorker"."EmploymentStatus" in ('Agency') AND "LocalAuthorityReportWorker"."StaffRecordComplete" = true) AS "NumberOfAgencyStaffRecordsCompleted"
    FROM cqc."LocalAuthorityReportWorker"
    WHERE
      "LocalAuthorityReportWorker"."EstablishmentFK" = establishmentID
    GROUP BY
      "EstablishmentFK", "WorkplaceFK"
  ) "EstablishmentWorkers" ON "EstablishmentWorkers"."WorkplaceFK" = "Establishment"."EstablishmentID"
  WHERE
  ("Establishment"."EstablishmentID" = establishmentID OR "Establishment"."ParentID" = establishmentID) AND
  "Archived" = false
ORDER BY
  "EstablishmentID";

LOOP
  FETCH AllEstablishments INTO CurrentEstablishment;
  EXIT WHEN NOT FOUND;

  -- RAISE NOTICE 'localAuthorityReportEstablishment: %, %, %, %, %, % %',
  -- 	CurrentEstablishment."EstablishmentID",
  -- 	CurrentEstablishment."NmdsID",
  -- 	CurrentEstablishment."NameValue",
  -- 	CurrentEstablishment.lastupdateddate,
  -- 	CurrentEstablishment."EmployerTypeValue",
  -- 	CurrentEstablishment."MainServiceFKValue",
  -- 	CurrentEstablishment."MainService";

  -- 16 is Head ofice services
  IF CurrentEstablishment."MainServiceFKValue" = 16 THEN
    CalculatedServiceUserGroups := 'n/a';
  ELSIF CurrentEstablishment."MainServiceFKValue" <> 16 AND CurrentEstablishment."ServiceUsersCount" > 0 THEN
    CalculatedServiceUserGroups := 'Completed';
  ELSE
    CalculatedServiceUserGroups := 'Missing';
  END IF;

  IF CurrentEstablishment."Capacities" = -1 THEN
    CalculatedCapacity := 'Missing';
  ELSIF CurrentEstablishment."Capacities" IS NULL THEN
    CalculatedCapacity := 'n/a';
  ELSE
    CalculatedCapacity := CurrentEstablishment."Capacities"::TEXT;
  END IF;
  IF CurrentEstablishment."Utilisations" = -1 THEN
    CalculatedUtilisation := 'Missing';
  ELSIF CurrentEstablishment."Utilisations" IS NULL THEN
    CalculatedUtilisation := 'n/a';
  ELSE
    CalculatedUtilisation := CurrentEstablishment."Utilisations"::TEXT;
  END IF;

  IF CurrentEstablishment."VacanciesValue" IS NOT NULL AND CurrentEstablishment."VacanciesValue" = 'With Jobs' THEN
    CalculatedVacancies := CurrentEstablishment."Vacancies"::TEXT;
  ELSIF CurrentEstablishment."VacanciesValue" IS NULL THEN
    CalculatedVacancies := 'Missing';
  ELSE
    CalculatedVacancies := 0;
  END IF;

  IF CurrentEstablishment."StartersValue" IS NOT NULL AND CurrentEstablishment."StartersValue" = 'With Jobs' THEN
    CalculatedStarters := CurrentEstablishment."Starters"::TEXT;
  ELSIF CurrentEstablishment."StartersValue" IS NULL THEN
    CalculatedStarters := 'Missing';
  ELSE
    CalculatedStarters := 0;
  END IF;

  IF CurrentEstablishment."LeaversValue" IS NOT NULL AND CurrentEstablishment."LeaversValue" = 'With Jobs' THEN
    CalculatedLeavers := CurrentEstablishment."Leavers"::TEXT;
  ELSIF CurrentEstablishment."LeaversValue" IS NULL THEN
    CalculatedLeavers := 'Missing';
  ELSE
    CalculatedLeavers := 0;
  END IF;


  IF CurrentEstablishment."NumberOfStaffValue" IS NOT NULL THEN
    CalculatedNumberOfStaff := CurrentEstablishment."NumberOfStaffValue"::TEXT;
    CalculatedNumberOfStaffInt := CurrentEstablishment."NumberOfStaffValue";
  ELSE
    CalculatedNumberOfStaff := 'Missing';
  END IF;

  IF CurrentEstablishment."EmployerTypeValue" IS NOT NULL THEN
    CalculatedEmployerType := CurrentEstablishment."EmployerTypeValue";
  ELSE
    CalculatedEmployerType := 'Missing';
  END IF;

  -- calculated the workplace "completed" flag is only true if:
  -- 1. The establishment type is one of Local Authority
  -- 2. The main service is known
  -- 3. The service user group is not -99 (n/a and completed are acceptable)
  -- 4. If the capacity of main service is not -99 (NULL is acceptable as is 0 or more)
  -- 5. If the utilisation of main service is not -99 (NULL is acceptable as is 0 or more)
  -- 6. If number of staff is not -99 (0 or more is acceptable)
  -- 7. If vacancies is not -99 (0 or more is acceptable)
  -- 8. If starters is not -99 (0 or more is acceptable)
  -- 9. If leavers is not -99 (0 or more is acceptable)
  CalculatedWorkplaceComplete := true;
  IF CurrentEstablishment.updated::DATE < reportFrom THEN
    -- RAISE NOTICE 'Establishment record not been updated';
    CalculatedWorkplaceComplete := false;
  END IF;

  IF SUBSTRING(CalculatedEmployerType::text from 1 for 15) <> 'Local Authority' THEN
    -- RAISE NOTICE 'employer type is NOT local authority: %', SUBSTRING(CalculatedEmployerType::text from 1 for 15);
    CalculatedWorkplaceComplete := false;
  END IF;

  IF CalculatedServiceUserGroups = 'Missing' THEN
    -- RAISE NOTICE 'calculated service groups is NOT valid: %', CalculatedServiceUserGroups;
    CalculatedWorkplaceComplete := false;
  END IF;

  IF CalculatedCapacity = 'Missing' THEN
    -- RAISE NOTICE 'calculated capacity is NOT valid: %', CalculatedCapacity;
    CalculatedWorkplaceComplete := false;
  END IF;

  IF CalculatedUtilisation = 'Missing' THEN
    -- RAISE NOTICE 'calculated utilisation is NOT valid: %', CalculatedUtilisation;
    CalculatedWorkplaceComplete := false;
  END IF;

  IF CalculatedNumberOfStaff = 'Missing' THEN
    -- RAISE NOTICE 'calculated number of staff is NOT valid: %', CalculatedNumberOfStaff;
    CalculatedWorkplaceComplete := false;
  END IF;

  IF CalculatedVacancies = 'Missing' THEN
    -- RAISE NOTICE 'calculated vacancies is NOT valid: %', CalculatedVacancies;
    CalculatedWorkplaceComplete := false;
  END IF;
  IF CalculatedStarters = 'Missing' THEN
    -- RAISE NOTICE 'calculated starters is NOT valid: %', CalculatedStarters;
    CalculatedWorkplaceComplete := false;
  END IF;
  IF CalculatedLeavers = 'Missing' THEN
    -- RAISE NOTICE 'calculated leavers is NOT valid: %', CalculatedLeavers;
    CalculatedWorkplaceComplete := false;
  END IF;

  INSERT INTO cqc."LocalAuthorityReportEstablishment" (
    "ReportFrom",
    "ReportTo",
    "EstablishmentFK",
    "WorkplaceFK",
    "WorkplaceName",
    "WorkplaceID",
    "LastUpdatedDate",
    "EstablishmentType",
    "MainService",
    "ServiceUserGroups",
    "CapacityOfMainService",
    "UtilisationOfMainService",
    "NumberOfVacancies",
    "NumberOfStarters",
    "NumberOfLeavers",
    "NumberOfStaffRecords",
    "WorkplaceComplete",
    "NumberOfIndividualStaffRecords",
    "PercentageOfStaffRecords",
    "NumberOfStaffRecordsNotAgency",
    "NumberOfCompleteStaffNotAgency",
    "PercentageOfCompleteStaffRecords",
    "NumberOfAgencyStaffRecords",
    "NumberOfCompleteAgencyStaffRecords",
    "PercentageOfCompleteAgencyStaffRecords"
  ) VALUES (
    reportFrom,
    reportTo,
    establishmentID,
    CurrentEstablishment."EstablishmentID",
    CurrentEstablishment."NameValue",
    CurrentEstablishment."NmdsID",
    CurrentEstablishment.updated::DATE,
    CalculatedEmployerType,
    CurrentEstablishment."MainService",
    CalculatedServiceUserGroups,
    CalculatedCapacity,
    CalculatedUtilisation,
    CalculatedVacancies,
    CalculatedStarters,
    CalculatedLeavers,
    CalculatedNumberOfStaff,
    CalculatedWorkplaceComplete,
    CASE WHEN CurrentEstablishment."NumberOfIndividualStaffRecords" IS NOT NULL THEN CurrentEstablishment."NumberOfIndividualStaffRecords" ELSE 0 END,
    CASE WHEN CalculatedNumberOfStaff <> 'Missing' AND CurrentEstablishment."NumberOfIndividualStaffRecords" IS NOT NULL AND CalculatedNumberOfStaffInt::NUMERIC > 0 THEN ((CurrentEstablishment."NumberOfIndividualStaffRecords"::NUMERIC / CalculatedNumberOfStaffInt::NUMERIC) * 100.0)::NUMERIC(10,1) ELSE 0.00::NUMERIC END,
    CASE WHEN CurrentEstablishment."NumberOfStaffRecordsNotAgency" IS NOT NULL THEN CurrentEstablishment."NumberOfStaffRecordsNotAgency" ELSE 0 END,
    CASE WHEN CurrentEstablishment."NumberOfStaffRecordsNotAgencyCompleted" IS NOT NULL THEN CurrentEstablishment."NumberOfStaffRecordsNotAgencyCompleted" ELSE 0 END,
    CASE WHEN CurrentEstablishment."NumberOfStaffRecordsNotAgency" > 0 AND CurrentEstablishment."NumberOfStaffRecordsNotAgency" IS NOT NULL AND CurrentEstablishment."NumberOfStaffRecordsNotAgencyCompleted" IS NOT NULL THEN ((CurrentEstablishment."NumberOfStaffRecordsNotAgencyCompleted"::NUMERIC / CurrentEstablishment."NumberOfStaffRecordsNotAgency"::NUMERIC) * 100.0)::NUMERIC(10,1) ELSE 0.0::NUMERIC END,
    CASE WHEN CurrentEstablishment."NumberOfAgencyStaffRecords" IS NOT NULL THEN CurrentEstablishment."NumberOfAgencyStaffRecords" ELSE 0 END,
    CASE WHEN CurrentEstablishment."NumberOfAgencyStaffRecordsCompleted" IS NOT NULL THEN CurrentEstablishment."NumberOfAgencyStaffRecordsCompleted" ELSE 0 END,
    CASE WHEN CurrentEstablishment."NumberOfAgencyStaffRecords" > 0 AND CurrentEstablishment."NumberOfAgencyStaffRecords" IS NOT NULL AND CurrentEstablishment."NumberOfAgencyStaffRecordsCompleted" IS NOT NULL THEN ((CurrentEstablishment."NumberOfAgencyStaffRecordsCompleted"::NUMERIC / CurrentEstablishment."NumberOfAgencyStaffRecords"::NUMERIC) * 100.0)::NUMERIC ELSE 0.0::NUMERIC(10,1) END
  );

END LOOP;

RETURN success;

 EXCEPTION WHEN OTHERS THEN
   GET STACKED DIAGNOSTICS v_error_stack=PG_EXCEPTION_CONTEXT, v_error_msg=MESSAGE_TEXT;
   RAISE WARNING 'localAuthorityReportWorker: %: %', v_error_msg, v_error_stack;
   RETURN false;

END;
$BODY$;
`;

module.exports = {
  up: async (queryInterface) => {
    return await queryInterface.sequelize.query(refactoredFunctionDefinition);
  },

  down: async (queryInterface) => {
    return await queryInterface.sequelize.query(originalFunctionDefinition);
  },
};
