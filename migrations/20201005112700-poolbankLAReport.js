'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.sequelize.query(`
CREATE OR REPLACE FUNCTION cqc.localauthorityreportworker(establishmentid integer,reportfrom date,reportto date)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$DECLARE
  success BOOLEAN;
  v_error_msg TEXT;
  v_error_stack TEXT;
  AllWorkers REFCURSOR;
  CurrentWorker RECORD;
  CalculatedGender TEXT;
  CalculatedDateOfBirth TEXT;
  CalculatedEthnicity TEXT;
  CalculatedMainJobRole TEXT;
  CalculatedEmploymentStatus TEXT;
  CalculatedSickDays TEXT;
  CalculatedPayInterval TEXT;
  CalculatedPayRate TEXT;
  CalculatedRelevantSocialCareQualification TEXT;
  CalculatedHighestSocialCareQualification TEXT;
  CalculatedNonSocialCareQualification TEXT;
  CalculatedContractedAverageHours TEXT;
  CalculatedStaffComplete BOOLEAN := true;
BEGIN
  success := true;

  RAISE NOTICE 'localAuthorityReportWorker (%) from % to %', establishmentID, reportFrom, reportTo;

  OPEN AllWorkers FOR
  SELECT
    "Establishment"."EstablishmentID" AS "WorkplaceFK",
    "Establishment"."NameValue" AS "WorkplaceName",
    "Establishment"."NmdsID" AS "WorkplaceID",
    "Worker".updated,
    "Worker"."ID" AS "WorkerID",
    "Worker"."NameOrIdValue",
    "Worker"."GenderValue",
    "Worker"."GenderSavedAt",
    "Worker"."DateOfBirthValue",
    "Worker"."DateOfBirthSavedAt",
    "Ethnicity"."Ethnicity" AS "Ethnicity",
    "Worker"."EthnicityFKValue",
    "Worker"."EthnicityFKSavedAt",
    "Job"."JobName" AS "MainJobRole",
    "Worker"."MainJobFKValue",
    "Worker"."MainJobFKSavedAt",
    "ContractValue",
    "ContractSavedAt",
    "WeeklyHoursContractedValue",
    "WeeklyHoursContractedHours",
    "WeeklyHoursContractedSavedAt",
    "WeeklyHoursAverageValue",
    "WeeklyHoursAverageHours",
    "WeeklyHoursAverageSavedAt",
    "ZeroHoursContractValue",
    "ZeroHoursContractSavedAt",
    "DaysSickValue",
    "DaysSickDays",
    "DaysSickSavedAt",
    "AnnualHourlyPayValue",
    "AnnualHourlyPayRate",
    "AnnualHourlyPaySavedAt",
    "QualificationInSocialCareValue",
    "QualificationInSocialCareSavedAt",
    "Qualification"."Level" AS "QualificationInSocialCare",
    "SocialCareQualificationFKValue",
    "SocialCareQualificationFKSavedAt",
    "OtherQualificationsValue",
    "OtherQualificationsSavedAt"
  FROM cqc."Worker"
    INNER JOIN cqc."Establishment" on "Establishment"."EstablishmentID" = "Worker"."EstablishmentFK" AND "Establishment"."Archived" = false AND ("Establishment"."EstablishmentID" = establishmentID OR "Establishment"."ParentID" = establishmentID)
    LEFT JOIN cqc."Ethnicity" on "Worker"."EthnicityFKValue" = "Ethnicity"."ID"
    LEFT JOIN cqc."Job" on "Worker"."MainJobFKValue" = "Job"."JobID"
    LEFT JOIN cqc."Qualification" on "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
  WHERE
    "Worker"."Archived" = false;

  LOOP
    FETCH AllWorkers INTO CurrentWorker;
    EXIT WHEN NOT FOUND;

    -- RAISE NOTICE 'localAuthorityReportWorker: %, %, %, %, %, % %',
    -- 	CurrentWorker."NameOrIdValue",
    -- 	CurrentWorker."Ethnicity",
    -- 	CurrentWorker."GenderValue",
    -- 	CurrentWorker.updated,
    -- 	CurrentWorker."ContractValue",
    -- 	CurrentWorker."AnnualHourlyPayRate",
    -- 	CurrentWorker."AnnualHourlyPayRate";

    IF CurrentWorker."GenderValue" IS NULL THEN
      CalculatedGender := 'Missing';
    ELSE
      CalculatedGender := CurrentWorker."GenderValue"::TEXT;
    END IF;

    IF CurrentWorker."DateOfBirthValue" IS NULL THEN
      CalculatedDateOfBirth := 'Missing';
    ELSE
      CalculatedDateOfBirth := TO_CHAR(CurrentWorker."DateOfBirthValue", 'DD/MM/YYYY');
    END IF;

    IF CurrentWorker."EthnicityFKValue" IS NULL THEN
      CalculatedEthnicity := 'Missing';
    ELSE
      CalculatedEthnicity := CurrentWorker."Ethnicity";
    END IF;

    IF CurrentWorker."MainJobFKValue" IS NULL THEN
      CalculatedMainJobRole := 'Missing';
    ELSE
      CalculatedMainJobRole := CurrentWorker."MainJobRole";
    END IF;

    IF CurrentWorker."ContractValue" IS NULL THEN
      CalculatedEmploymentStatus := 'Missing';
    ELSE
      CalculatedEmploymentStatus := CurrentWorker."ContractValue";
    END IF;

    IF CurrentWorker."DaysSickValue" IS NULL THEN
      CalculatedSickDays := 'Missing';
    ELSE
      IF CurrentWorker."DaysSickValue" = 'Yes' THEN
        IF CurrentWorker."DaysSickDays" IS NOT NULL THEN
          CalculatedSickDays = CurrentWorker."DaysSickDays"::TEXT;
        ELSE
          CalculatedSickDays = 'Missing';
        END IF;
      ELSIF CurrentWorker."DaysSickValue" = 'No' THEN
        CalculatedSickDays := 'Don''t know';
      ELSE
        CalculatedSickDays := CurrentWorker."DaysSickValue";
      END IF;
    END IF;

    IF CurrentWorker."AnnualHourlyPayValue" IS NOT NULL THEN
      CalculatedPayInterval := CurrentWorker."AnnualHourlyPayValue";

      IF CurrentWorker."AnnualHourlyPayRate" IS NULL OR CurrentWorker."AnnualHourlyPayValue" = 'Don''t know' THEN
        CalculatedPayRate := 'Missing';
      ELSE
        CalculatedPayRate := CurrentWorker."AnnualHourlyPayRate";
      END IF;
    ELSE
      CalculatedPayRate := 'Missing';
      CalculatedPayInterval := 'Missing';
    END IF;

    IF CurrentWorker."QualificationInSocialCareValue" IS NOT NULL THEN
      CalculatedRelevantSocialCareQualification := CurrentWorker."QualificationInSocialCareValue";

      -- the highest social care qualification level is only relevant if knowing the qualification in social care
      IF CurrentWorker."QualificationInSocialCareValue" = 'Yes' THEN
        IF CurrentWorker."QualificationInSocialCare" IS NOT NULL THEN
          CalculatedHighestSocialCareQualification := CurrentWorker."QualificationInSocialCare";
        ELSE
          CalculatedHighestSocialCareQualification := 'Missing';
        END IF;
      ELSE
        CalculatedHighestSocialCareQualification := 'n/a';
      END IF;
    ELSE
      CalculatedRelevantSocialCareQualification := 'Missing';
      CalculatedHighestSocialCareQualification := 'Missing';
    END IF;

    -- a social worker (27) and an occupational therapist (18) must both have qualifications relevant to social care - override the default checks
    IF CurrentWorker."MainJobFKValue" IS NOT NULL and CurrentWorker."MainJobFKValue" in (18,27) THEN
      IF CurrentWorker."QualificationInSocialCareValue" IS NULL OR CurrentWorker."QualificationInSocialCareValue" <> 'Yes' THEN
        CalculatedRelevantSocialCareQualification := 'Must be yes';
      END IF;
      IF CurrentWorker."QualificationInSocialCare" IS NULL THEN
        CalculatedRelevantSocialCareQualification := 'Must be yes';
      END IF;
    END IF;

    IF CurrentWorker."OtherQualificationsValue" IS NULL THEN
      CalculatedNonSocialCareQualification := 'Missing';
    ELSE
      CalculatedNonSocialCareQualification := CurrentWorker."OtherQualificationsValue";
    END IF;

    -- if contract type is perm/temp contracted hours else average hours
    IF CurrentWorker."ContractValue" in ('Permanent', 'Temporary') THEN
      -- if zero hours contractor, then use average hours not contracted hours
      IF CurrentWorker."ZeroHoursContractValue" IS NOT NULL AND CurrentWorker."ZeroHoursContractValue" = 'Yes' THEN
        IF  CurrentWorker."ZeroHoursContractValue" = 'Yes' AND CurrentWorker."WeeklyHoursAverageHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursAverageHours"::TEXT;
        ELSIF CurrentWorker."ZeroHoursContractValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
      ELSE
        IF CurrentWorker."WeeklyHoursContractedValue" = 'Yes' AND CurrentWorker."WeeklyHoursContractedHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursContractedHours" ;
        ELSIF CurrentWorker."WeeklyHoursContractedValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
      END IF;
    ELSE
        IF  CurrentWorker."WeeklyHoursAverageValue" = 'Yes' AND CurrentWorker."WeeklyHoursAverageHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursAverageHours"::TEXT;
        ELSIF CurrentWorker."WeeklyHoursAverageValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
    END IF;
    IF CalculatedContractedAverageHours IS NULL THEN
      CalculatedContractedAverageHours := 'Missing';
    END IF;

    -- now calculate worker completion - which for an agency worker only includes just contracted/average hours, main job and the two salary fields
    CalculatedStaffComplete := true;
    IF CurrentWorker.updated::DATE < reportFrom THEN
      -- RAISE NOTICE 'Worker record not been updated';
      CalculatedStaffComplete := false;
    END IF;
    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedGender in ('Missing')  THEN
      -- RAISE NOTICE 'calculated gender is NOT valid: %', CalculatedGender;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedDateOfBirth in ('Missing')  THEN
      -- RAISE NOTICE 'calculated date of birth is NOT valid: %', CalculatedDateOfBirth;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedEthnicity in ('Missing')  THEN
      -- RAISE NOTICE 'calculated ethnicity is NOT valid: %', CalculatedEthnicity;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedMainJobRole in ('Missing')  THEN
      -- RAISE NOTICE 'calculated main job role is NOT valid: %', CalculatedMainJobRole;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus in ('Missing')  THEN
      -- RAISE NOTICE 'calculated contract is NOT valid: %', CalculatedEmploymentStatus;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus NOT IN ('Agency', 'Pool/Bank') AND CalculatedSickDays in ('Missing')  THEN
      -- RAISE NOTICE 'calculated days sick is NOT valid: %', CalculatedSickDays;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedPayInterval in ('Missing')  THEN
      -- RAISE NOTICE 'calculated pay interval is NOT valid: %', CalculatedPayInterval;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedPayRate in ('Missing')  THEN
      -- RAISE NOTICE 'calculated pay rate is NOT valid: %', CalculatedPayRate;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedRelevantSocialCareQualification in ('Missing', 'Must be yes')  THEN
      -- RAISE NOTICE 'calculated relevant social care qualification is NOT valid: %', CalculatedRelevantSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedHighestSocialCareQualification in ('Missing', 'Must be yes')  THEN
      -- RAISE NOTICE 'calculated highest social care qualification is NOT valid: %', CalculatedHighestSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedNonSocialCareQualification in ('Missing')  THEN
      -- RAISE NOTICE 'calculated relevant non-social care qualification is NOT valid: %', CalculatedNonSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedContractedAverageHours in ('Missing')  THEN
      -- RAISE NOTICE 'calculated contracted/average hours is NOT valid: %', CalculatedContractedAverageHours;
      CalculatedStaffComplete := false;
    END IF;

    INSERT INTO cqc."LocalAuthorityReportWorker" (
      "EstablishmentFK",
      "WorkplaceFK",
      "WorkerFK",
      "LocalID",
      "WorkplaceName",
      "WorkplaceID",
      "Gender",
      "DateOfBirth",
      "Ethnicity",
      "MainJob",
      "EmploymentStatus",
      "ContractedAverageHours",
      "SickDays",
      "PayInterval",
      "RateOfPay",
      "RelevantSocialCareQualification",
      "HighestSocialCareQualification",
      "NonSocialCareQualification",
      "LastUpdated",
      "StaffRecordComplete"
    ) VALUES (
      EstablishmentID,
      CurrentWorker."WorkplaceFK",
      CurrentWorker."WorkerID",
      CurrentWorker."NameOrIdValue",
      CurrentWorker."WorkplaceName",
      CurrentWorker."WorkplaceID",
      CalculatedGender,
      CalculatedDateOfBirth,
      CalculatedEthnicity,
      CalculatedMainJobRole,
      CalculatedEmploymentStatus,
      CalculatedContractedAverageHours,
      CalculatedSickDays,
      CalculatedPayInterval,
      CalculatedPayRate,
      CalculatedRelevantSocialCareQualification,
      CalculatedHighestSocialCareQualification,
      CalculatedNonSocialCareQualification,
      CurrentWorker.updated,
      CalculatedStaffComplete
    );

  END LOOP;

  RETURN success;

  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_stack=PG_EXCEPTION_CONTEXT, v_error_msg=MESSAGE_TEXT;
    RAISE WARNING 'localAuthorityReportWorker: %: %', v_error_msg, v_error_stack;
    RETURN false;

END;$BODY$;
    `);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.sequelize.query(`
CREATE FUNCTION cqc.localauthorityreportworker(establishmentid integer, reportfrom date, reportto date) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
  success BOOLEAN;
  v_error_msg TEXT;
  v_error_stack TEXT;
  AllWorkers REFCURSOR;
  CurrentWorker RECORD;
  CalculatedGender TEXT;
  CalculatedDateOfBirth TEXT;
  CalculatedEthnicity TEXT;
  CalculatedMainJobRole TEXT;
  CalculatedEmploymentStatus TEXT;
  CalculatedSickDays TEXT;
  CalculatedPayInterval TEXT;
  CalculatedPayRate TEXT;
  CalculatedRelevantSocialCareQualification TEXT;
  CalculatedHighestSocialCareQualification TEXT;
  CalculatedNonSocialCareQualification TEXT;
  CalculatedContractedAverageHours TEXT;
  CalculatedStaffComplete BOOLEAN := true;
BEGIN
  success := true;

  RAISE NOTICE 'localAuthorityReportWorker (%) from % to %', establishmentID, reportFrom, reportTo;

  OPEN AllWorkers FOR
  SELECT
    "Establishment"."EstablishmentID" AS "WorkplaceFK",
    "Establishment"."NameValue" AS "WorkplaceName",
    "Establishment"."NmdsID" AS "WorkplaceID",
    "Worker".updated,
    "Worker"."ID" AS "WorkerID",
    "Worker"."NameOrIdValue",
    "Worker"."GenderValue",
    "Worker"."GenderSavedAt",
    "Worker"."DateOfBirthValue",
    "Worker"."DateOfBirthSavedAt",
    "Ethnicity"."Ethnicity" AS "Ethnicity",
    "Worker"."EthnicityFKValue",
    "Worker"."EthnicityFKSavedAt",
    "Job"."JobName" AS "MainJobRole",
    "Worker"."MainJobFKValue",
    "Worker"."MainJobFKSavedAt",
    "ContractValue",
    "ContractSavedAt",
    "WeeklyHoursContractedValue",
    "WeeklyHoursContractedHours",
    "WeeklyHoursContractedSavedAt",
    "WeeklyHoursAverageValue",
    "WeeklyHoursAverageHours",
    "WeeklyHoursAverageSavedAt",
    "ZeroHoursContractValue",
    "ZeroHoursContractSavedAt",
    "DaysSickValue",
    "DaysSickDays",
    "DaysSickSavedAt",
    "AnnualHourlyPayValue",
    "AnnualHourlyPayRate",
    "AnnualHourlyPaySavedAt",
    "QualificationInSocialCareValue",
    "QualificationInSocialCareSavedAt",
    "Qualification"."Level" AS "QualificationInSocialCare",
    "SocialCareQualificationFKValue",
    "SocialCareQualificationFKSavedAt",
    "OtherQualificationsValue",
    "OtherQualificationsSavedAt"
  FROM cqc."Worker"
    INNER JOIN cqc."Establishment" on "Establishment"."EstablishmentID" = "Worker"."EstablishmentFK" AND "Establishment"."Archived" = false AND ("Establishment"."EstablishmentID" = establishmentID OR "Establishment"."ParentID" = establishmentID)
    LEFT JOIN cqc."Ethnicity" on "Worker"."EthnicityFKValue" = "Ethnicity"."ID"
    LEFT JOIN cqc."Job" on "Worker"."MainJobFKValue" = "Job"."JobID"
    LEFT JOIN cqc."Qualification" on "Worker"."SocialCareQualificationFKValue" = "Qualification"."ID"
  WHERE
    "Worker"."Archived" = false;

  LOOP
    FETCH AllWorkers INTO CurrentWorker;
    EXIT WHEN NOT FOUND;

    -- RAISE NOTICE 'localAuthorityReportWorker: %, %, %, %, %, % %',
    -- 	CurrentWorker."NameOrIdValue",
    -- 	CurrentWorker."Ethnicity",
    -- 	CurrentWorker."GenderValue",
    -- 	CurrentWorker.updated,
    -- 	CurrentWorker."ContractValue",
    -- 	CurrentWorker."AnnualHourlyPayRate",
    -- 	CurrentWorker."AnnualHourlyPayRate";

    IF CurrentWorker."GenderValue" IS NULL THEN
      CalculatedGender := 'Missing';
    ELSE
      CalculatedGender := CurrentWorker."GenderValue"::TEXT;
    END IF;

    IF CurrentWorker."DateOfBirthValue" IS NULL THEN
      CalculatedDateOfBirth := 'Missing';
    ELSE
      CalculatedDateOfBirth := TO_CHAR(CurrentWorker."DateOfBirthValue", 'DD/MM/YYYY');
    END IF;

    IF CurrentWorker."EthnicityFKValue" IS NULL THEN
      CalculatedEthnicity := 'Missing';
    ELSE
      CalculatedEthnicity := CurrentWorker."Ethnicity";
    END IF;

    IF CurrentWorker."MainJobFKValue" IS NULL THEN
      CalculatedMainJobRole := 'Missing';
    ELSE
      CalculatedMainJobRole := CurrentWorker."MainJobRole";
    END IF;

    IF CurrentWorker."ContractValue" IS NULL THEN
      CalculatedEmploymentStatus := 'Missing';
    ELSE
      CalculatedEmploymentStatus := CurrentWorker."ContractValue";
    END IF;

    IF CurrentWorker."DaysSickValue" IS NULL THEN
      CalculatedSickDays := 'Missing';
    ELSE
      IF CurrentWorker."DaysSickValue" = 'Yes' THEN
        IF CurrentWorker."DaysSickDays" IS NOT NULL THEN
          CalculatedSickDays = CurrentWorker."DaysSickDays"::TEXT;
        ELSE
          CalculatedSickDays = 'Missing';
        END IF;
      ELSIF CurrentWorker."DaysSickValue" = 'No' THEN
        CalculatedSickDays := 'Don''t know';
      ELSE
        CalculatedSickDays := CurrentWorker."DaysSickValue";
      END IF;
    END IF;

    IF CurrentWorker."AnnualHourlyPayValue" IS NOT NULL THEN
      CalculatedPayInterval := CurrentWorker."AnnualHourlyPayValue";

      IF CurrentWorker."AnnualHourlyPayRate" IS NULL OR CurrentWorker."AnnualHourlyPayValue" = 'Don''t know' THEN
        CalculatedPayRate := 'Missing';
      ELSE
        CalculatedPayRate := CurrentWorker."AnnualHourlyPayRate";
      END IF;
    ELSE
      CalculatedPayRate := 'Missing';
      CalculatedPayInterval := 'Missing';
    END IF;

    IF CurrentWorker."QualificationInSocialCareValue" IS NOT NULL THEN
      CalculatedRelevantSocialCareQualification := CurrentWorker."QualificationInSocialCareValue";

      -- the highest social care qualification level is only relevant if knowing the qualification in social care
      IF CurrentWorker."QualificationInSocialCareValue" = 'Yes' THEN
        IF CurrentWorker."QualificationInSocialCare" IS NOT NULL THEN
          CalculatedHighestSocialCareQualification := CurrentWorker."QualificationInSocialCare";
        ELSE
          CalculatedHighestSocialCareQualification := 'Missing';
        END IF;
      ELSE
        CalculatedHighestSocialCareQualification := 'n/a';
      END IF;
    ELSE
      CalculatedRelevantSocialCareQualification := 'Missing';
      CalculatedHighestSocialCareQualification := 'Missing';
    END IF;

    -- a social worker (27) and an occupational therapist (18) must both have qualifications relevant to social care - override the default checks
    IF CurrentWorker."MainJobFKValue" IS NOT NULL and CurrentWorker."MainJobFKValue" in (18,27) THEN
      IF CurrentWorker."QualificationInSocialCareValue" IS NULL OR CurrentWorker."QualificationInSocialCareValue" <> 'Yes' THEN
        CalculatedRelevantSocialCareQualification := 'Must be yes';
      END IF;
      IF CurrentWorker."QualificationInSocialCare" IS NULL THEN
        CalculatedRelevantSocialCareQualification := 'Must be yes';
      END IF;
    END IF;

    IF CurrentWorker."OtherQualificationsValue" IS NULL THEN
      CalculatedNonSocialCareQualification := 'Missing';
    ELSE
      CalculatedNonSocialCareQualification := CurrentWorker."OtherQualificationsValue";
    END IF;

    -- if contract type is perm/temp contracted hours else average hours
    IF CurrentWorker."ContractValue" in ('Permanent', 'Temporary') THEN
      -- if zero hours contractor, then use average hours not contracted hours
      IF CurrentWorker."ZeroHoursContractValue" IS NOT NULL AND CurrentWorker."ZeroHoursContractValue" = 'Yes' THEN
        IF  CurrentWorker."ZeroHoursContractValue" = 'Yes' AND CurrentWorker."WeeklyHoursAverageHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursAverageHours"::TEXT;
        ELSIF CurrentWorker."ZeroHoursContractValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
      ELSE
        IF CurrentWorker."WeeklyHoursContractedValue" = 'Yes' AND CurrentWorker."WeeklyHoursContractedHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursContractedHours" ;
        ELSIF CurrentWorker."WeeklyHoursContractedValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
      END IF;
    ELSE
        IF  CurrentWorker."WeeklyHoursAverageValue" = 'Yes' AND CurrentWorker."WeeklyHoursAverageHours" IS NOT NULL THEN
          CalculatedContractedAverageHours := CurrentWorker."WeeklyHoursAverageHours"::TEXT;
        ELSIF CurrentWorker."WeeklyHoursAverageValue" = 'No' THEN
          CalculatedContractedAverageHours := 'Don''t know';
        ELSE
          CalculatedContractedAverageHours := 'Missing';
        END IF;
    END IF;
    IF CalculatedContractedAverageHours IS NULL THEN
      CalculatedContractedAverageHours := 'Missing';
    END IF;

    -- now calculate worker completion - which for an agency worker only includes just contracted/average hours, main job and the two salary fields
    CalculatedStaffComplete := true;
    IF CurrentWorker.updated::DATE < reportFrom THEN
      -- RAISE NOTICE 'Worker record not been updated';
      CalculatedStaffComplete := false;
    END IF;
    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedGender in ('Missing')  THEN
      -- RAISE NOTICE 'calculated gender is NOT valid: %', CalculatedGender;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedDateOfBirth in ('Missing')  THEN
      -- RAISE NOTICE 'calculated date of birth is NOT valid: %', CalculatedDateOfBirth;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedEthnicity in ('Missing')  THEN
      -- RAISE NOTICE 'calculated ethnicity is NOT valid: %', CalculatedEthnicity;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedMainJobRole in ('Missing')  THEN
      -- RAISE NOTICE 'calculated main job role is NOT valid: %', CalculatedMainJobRole;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus in ('Missing')  THEN
      -- RAISE NOTICE 'calculated contract is NOT valid: %', CalculatedEmploymentStatus;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedSickDays in ('Missing')  THEN
      -- RAISE NOTICE 'calculated days sick is NOT valid: %', CalculatedSickDays;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedPayInterval in ('Missing')  THEN
      -- RAISE NOTICE 'calculated pay interval is NOT valid: %', CalculatedPayInterval;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedPayRate in ('Missing')  THEN
      -- RAISE NOTICE 'calculated pay rate is NOT valid: %', CalculatedPayRate;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedRelevantSocialCareQualification in ('Missing', 'Must be yes')  THEN
      -- RAISE NOTICE 'calculated relevant social care qualification is NOT valid: %', CalculatedRelevantSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedHighestSocialCareQualification in ('Missing', 'Must be yes')  THEN
      -- RAISE NOTICE 'calculated highest social care qualification is NOT valid: %', CalculatedHighestSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedEmploymentStatus <> 'Agency' AND CalculatedNonSocialCareQualification in ('Missing')  THEN
      -- RAISE NOTICE 'calculated relevant non-social care qualification is NOT valid: %', CalculatedNonSocialCareQualification;
      CalculatedStaffComplete := false;
    END IF;

    IF CalculatedContractedAverageHours in ('Missing')  THEN
      -- RAISE NOTICE 'calculated contracted/average hours is NOT valid: %', CalculatedContractedAverageHours;
      CalculatedStaffComplete := false;
    END IF;

    INSERT INTO cqc."LocalAuthorityReportWorker" (
      "EstablishmentFK",
      "WorkplaceFK",
      "WorkerFK",
      "LocalID",
      "WorkplaceName",
      "WorkplaceID",
      "Gender",
      "DateOfBirth",
      "Ethnicity",
      "MainJob",
      "EmploymentStatus",
      "ContractedAverageHours",
      "SickDays",
      "PayInterval",
      "RateOfPay",
      "RelevantSocialCareQualification",
      "HighestSocialCareQualification",
      "NonSocialCareQualification",
      "LastUpdated",
      "StaffRecordComplete"
    ) VALUES (
      EstablishmentID,
      CurrentWorker."WorkplaceFK",
      CurrentWorker."WorkerID",
      CurrentWorker."NameOrIdValue",
      CurrentWorker."WorkplaceName",
      CurrentWorker."WorkplaceID",
      CalculatedGender,
      CalculatedDateOfBirth,
      CalculatedEthnicity,
      CalculatedMainJobRole,
      CalculatedEmploymentStatus,
      CalculatedContractedAverageHours,
      CalculatedSickDays,
      CalculatedPayInterval,
      CalculatedPayRate,
      CalculatedRelevantSocialCareQualification,
      CalculatedHighestSocialCareQualification,
      CalculatedNonSocialCareQualification,
      CurrentWorker.updated,
      CalculatedStaffComplete
    );

  END LOOP;

  RETURN success;

  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_stack=PG_EXCEPTION_CONTEXT, v_error_msg=MESSAGE_TEXT;
    RAISE WARNING 'localAuthorityReportWorker: %: %', v_error_msg, v_error_stack;
    RETURN false;

END;
$$;
      `);
    });
  },
};
