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
    '2020-09-14' AS reportfrom,
    '2020-09-21' AS reportto,
    211,
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
        WHEN e.updated::DATE < '2020-09-14' THEN false
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
            WHERE lw."EstablishmentFK" = 211
            GROUP BY lw."EstablishmentFK", lw."WorkplaceFK"
        ) w ON w."WorkplaceFK" = est."EstablishmentID"
        ) e
        WHERE (e."EstablishmentID" = 211 OR e."ParentID" = 211)
            AND e."Archived" = false;

