'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS cqc.localauthorityreportadmin(date, date);'),
      await queryInterface.sequelize.query(`
-- FUNCTION: cqc.localauthorityreportadmin(date, date)

-- DROP FUNCTION cqc.localauthorityreportadmin(date, date);

CREATE OR REPLACE FUNCTION cqc.localauthorityreportadmin(
	reportfrom date,
	reportto date)
    RETURNS TABLE("LocalAuthority" text, "WorkplaceName" text, "WorkplaceID" text, "PrimaryEstablishmentID" integer, "LastYearsConfirmedNumbers" integer, "ThisYearsConfirmedNumbers" integer, "Notes" text, "Status" cqc."enum_LocalAuthorities_Status", "LatestUpdate" date, "WorkplacesCompleted" bigint, "StaffCompleted" bigint, "NumberOfWorkplaces" bigint, "NumberOfWorkplacesCompleted" bigint, "CountEstablishmentType" bigint, "CountMainService" bigint, "CountServiceUserGroups" bigint, "CountCapacity" bigint, "CountUiltisation" bigint, "CountNumberOfStaff" bigint, "CountVacancies" bigint, "CountStarters" bigint, "CountLeavers" bigint, "SumStaff" bigint, "CountIndividualStaffRecords" bigint, "CountOfIndividualStaffRecordsNotAgency" bigint, "CountOfIndividualStaffRecordsNotAgencyComplete" bigint, "PercentageNotAgencyComplete" numeric, "CountOfIndividualStaffRecordsAgency" bigint, "CountOfIndividualStaffRecordsAgencyComplete" bigint, "PercentageAgencyComplete" numeric, "CountOfGender" bigint, "CountOfDateOfBirth" bigint, "CountOfEthnicity" bigint, "CountOfMainJobRole" bigint, "CountOfEmploymentStatus" bigint, "CountOfContractedAverageHours" bigint, "CountOfSickness" bigint, "CountOfPay" bigint, "CountOfQualification" bigint)
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE success BOOLEAN;

v_error_msg TEXT;

v_error_stack TEXT;

AllLaEstablishments REFCURSOR;

CurrentEstablishment RECORD;

BEGIN success := true;

OPEN AllLaEstablishments FOR
SELECT
    MyLocalAuthorities."LocalAuthorityName",
    "Establishment"."NmdsID",
    "Establishment"."EstablishmentID",
    "LAEstablishment"."WorkplaceName",
    "LAEstablishment"."WorkplaceID"
FROM
    cqc."LocalAuthorities" AS MyLocalAuthorities
    LEFT JOIN cqc."Establishment" on "Establishment"."EstablishmentID" = MyLocalAuthorities."EstablishmentFK"
    LEFT JOIN cqc."LocalAuthorityReportEstablishment" AS "LAEstablishment" on "LAEstablishment"."WorkplaceID" = "Establishment"."NmdsID";

-- first, run through and generate all Local Authority user reports - NOW
LOOP FETCH AllLaEstablishments INTO CurrentEstablishment;

EXIT
WHEN NOT FOUND;

IF CurrentEstablishment."EstablishmentID" IS NOT NULL THEN PERFORM cqc.localAuthorityReport(
    CurrentEstablishment."EstablishmentID",
    reportFrom,
    reportTo
);

END IF;

END LOOP;

-- now report against all those generated user reports
RETURN QUERY
SELECT
    MyLocalAuthorities."LocalAuthorityName",
    regexp_replace(LAEstablishments."WorkplaceName", ',', '', 'g') AS "WorkplaceName",
    LAEstablishments."WorkplaceID",
    LAEstablishments."EstablishmentFK" AS "PrimaryEstablishmentID",
    MyLocalAuthorities."LastYear",
    MyLocalAuthorities."ThisYear",
    MyLocalAuthorities."Notes",
    MyLocalAuthorities."Status",
    -- 5
    CASE
        WHEN max(LAEstablishments2."LastUpdatedDate") > max(LAWorkers."LastUpdated") THEN max(LAEstablishments2."LastUpdatedDate")
        ELSE max(LAWorkers."LastUpdated")
    END AS "LatestUpdate",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."WorkplaceComplete" = true
    ) AS "WorkplacesCompleted",
    sum(LAWorkers."CountIndividualStaffRecordsCompleted") :: BIGINT AS "StaffCompleted",
    count(LAEstablishments2."WorkplaceID") AS "NumberOfWorkplaces",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."WorkplaceComplete" = true
    ) AS "NumberOfWorkplacesCompleted",
    -- 10
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            SUBSTRING(
                LAEstablishments2."EstablishmentType"
                from
                    1 for 15
            ) = 'Local Authority'
    ) AS "CountEstablishmentType",
    count(LAEstablishments2."WorkplaceID") AS "CountMainService",
    -- main service is mandatory
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."ServiceUserGroups" <> 'Missing'
    ) AS "CountServiceUserGroups",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."CapacityOfMainService" <> 'Missing'
    ) AS "CountCapacity",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."UtilisationOfMainService" <> 'Missing'
    ) AS "CountUiltisation",
    -- 15
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."NumberOfStaffRecords" <> 'Missing'
    ) AS "CountNumberOfStaff",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."NumberOfVacancies" <> 'Missing'
    ) AS "CountVacancies",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."NumberOfStarters" <> 'Missing'
    ) AS "CountStarters",
    count(LAEstablishments2."WorkplaceID") FILTER (
        WHERE
            LAEstablishments2."NumberOfLeavers" <> 'Missing'
    ) AS "CountLeavers",
    sum(
        LAEstablishments2."NumberOfStaffRecords" :: INTEGER
    ) FILTER (
        WHERE
            LAEstablishments2."NumberOfStaffRecords" <> 'Missing'
    ) AS "SumStaff",
    -- 20
    sum(LAWorkers."CountIndividualStaffRecords") :: BIGINT AS "CountIndividualStaffRecords",
    sum(
        LAWorkers."CountOfIndividualStaffRecordsNotAgency"
    ) :: BIGINT AS "CountOfIndividualStaffRecordsNotAgency",
    sum(
        LAWorkers."CountOfIndividualStaffRecordsNotAgencyComplete"
    ) :: BIGINT AS "CountOfIndividualStaffRecordsNotAgencyComplete",
    sum(LAWorkers."PercentageNotAgencyComplete") :: NUMERIC AS "PercentageNotAgencyComplete",
    sum(LAWorkers."CountOfIndividualStaffRecordsAgency") :: BIGINT AS "CountOfIndividualStaffRecordsAgency",
    -- 25
    sum(
        LAWorkers."CountOfIndividualStaffRecordsAgencyComplete"
    ) :: BIGINT AS "CountOfIndividualStaffRecordsAgencyComplete",
    sum(LAWorkers."PercentageAgencyComplete") :: NUMERIC AS "PercentageAgencyComplete",
    sum(LAWorkers."CountOfGender") :: BIGINT AS "CountOfGender",
    sum(LAWorkers."CountOfDateOfBirth") :: BIGINT AS "CountOfDateOfBirth",
    sum(LAWorkers."CountOfEthnicity") :: BIGINT AS "CountOfEthnicity",
    -- 30
    sum(LAWorkers."CountOfMainJobRole") :: BIGINT AS "CountOfMainJobRole",
    sum(LAWorkers."CountOfEmploymentStatus") :: BIGINT AS "CountOfEmploymentStatus",
    sum(LAWorkers."CountOfContractedAverageHours") :: BIGINT AS "CountOfContractedAverageHours",
    sum(LAWorkers."CountOfSickness") :: BIGINT AS "CountOfSickness",
    sum(LAWorkers."CountOfPay") :: BIGINT AS "CountOfPay",
    -- 35
    sum(LAWorkers."CountOfQualification") :: BIGINT AS "CountOfQualification"
FROM
    cqc."LocalAuthorities" AS MyLocalAuthorities
INNER JOIN cqc."LocalAuthorityReportEstablishment" LAEstablishments on LAEstablishments."WorkplaceFK" = MyLocalAuthorities."EstablishmentFK"
INNER JOIN cqc."LocalAuthorityReportEstablishment" LAEstablishments2 on LAEstablishments2."EstablishmentFK" = LAEstablishments."EstablishmentFK"
    LEFT JOIN (
        SELECT
            "WorkplaceFK",
            max("LastUpdated") AS "LastUpdated",
            count(LAWorkers2."MainJob") AS "CountIndividualStaffRecords",
            count(LAWorkers2."MainJob") FILTER (
                WHERE
                    LAWorkers2."StaffRecordComplete" = true
            ) AS "CountIndividualStaffRecordsCompleted",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."EmploymentStatus" <> 'Agency'
            ) AS "CountOfIndividualStaffRecordsNotAgency",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."EmploymentStatus" <> 'Agency'
                    AND LAWorkers2."StaffRecordComplete" = true
            ) AS "CountOfIndividualStaffRecordsNotAgencyComplete",
            0.00 :: NUMERIC AS "PercentageNotAgencyComplete",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."EmploymentStatus" = 'Agency'
            ) AS "CountOfIndividualStaffRecordsAgency",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."EmploymentStatus" = 'Agency'
                    AND LAWorkers2."StaffRecordComplete" = true
            ) AS "CountOfIndividualStaffRecordsAgencyComplete",
            0.00 :: NUMERIC AS "PercentageAgencyComplete",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."Gender" <> 'Missing'
            ) AS "CountOfGender",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."DateOfBirth" <> 'Missing'
            ) AS "CountOfDateOfBirth",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."Ethnicity" <> 'Missing'
            ) AS "CountOfEthnicity",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."MainJob" <> 'Missing'
            ) AS "CountOfMainJobRole",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."EmploymentStatus" <> 'Missing'
            ) AS "CountOfEmploymentStatus",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."ContractedAverageHours" <> 'Missing'
            ) AS "CountOfContractedAverageHours",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."SickDays" <> 'Missing'
            ) AS "CountOfSickness",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."PayInterval" <> 'Missing'
                    AND LAWorkers2."RateOfPay" <> 'Missing'
            ) AS "CountOfPay",
            count(LAWorkers2."EmploymentStatus") FILTER (
                WHERE
                    LAWorkers2."RelevantSocialCareQualification" <> 'Missing'
                    AND LAWorkers2."HighestSocialCareQualification" <> 'Missing'
                    AND LAWorkers2."NonSocialCareQualification" <> 'Missing'
            ) AS "CountOfQualification"
        FROM
            cqc."LocalAuthorityReportWorker" LAWorkers2
        group by
            LAWorkers2."WorkplaceFK"
    ) LAWorkers ON LAWorkers."WorkplaceFK" = LAEstablishments2."WorkplaceFK"
GROUP BY
    MyLocalAuthorities."LocalAuthorityName",
    LAEstablishments."WorkplaceName",
    LAEstablishments."WorkplaceID",
    LAEstablishments."EstablishmentFK",
    MyLocalAuthorities."LastYear",
    MyLocalAuthorities."ThisYear",
    MyLocalAuthorities."Notes",
    MyLocalAuthorities."Status"
ORDER BY
    MyLocalAuthorities."LocalAuthorityName",
    LAEstablishments."WorkplaceName";
END;
$BODY$;
     `),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS cqc.localauthorityreportadmin(date, date);'),
    ]);
  },
};
