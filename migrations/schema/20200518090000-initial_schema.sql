--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 11.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cqc; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA cqc;


--
-- Name: cqcref; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA cqcref;

--
-- Name: DataSource; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."DataSource" AS ENUM (
    'Online',
    'Bulk'
);


--
-- Name: EstablishmentAuditChangeType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."EstablishmentAuditChangeType" AS ENUM (
    'created',
    'updated',
    'saved',
    'changed',
    'deleted',
    'wdfEligible',
    'overalWdfEligible',
    'staffWdfEligible',
    'establishmentWdfEligible'
);


--
-- Name: LinkToParentStatus; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."LinkToParentStatus" AS ENUM (
    'REQUESTED',
    'APPROVED',
    'DENIED',
    'CANCELLED'
);


--
-- Name: NotificationType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."NotificationType" AS ENUM (
    'OWNERCHANGE',
    'LINKTOPARENTREQUEST',
    'LINKTOPARENTAPPROVED',
    'LINKTOPARENTREJECTED',
    'DELINKTOPARENT',
    'BECOMEAPARENT'
);


--
-- Name: ServicesCapacityType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."ServicesCapacityType" AS ENUM (
    'Capacity',
    'Utilisation'
);


--
-- Name: TrainingReportStates; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."TrainingReportStates" AS ENUM (
    'READY',
    'DOWNLOADING',
    'FAILED',
    'WARNINGS',
    'COMPLETING'
);


--
-- Name: UserAuditChangeType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."UserAuditChangeType" AS ENUM (
    'created',
    'updated',
    'saved',
    'changed',
    'passwdReset',
    'loginSuccess',
    'loginFailed',
    'loginWhileLocked',
    'delete'
);


--
-- Name: WdfReportStates; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WdfReportStates" AS ENUM (
    'READY',
    'DOWNLOADING',
    'FAILED',
    'WARNINGS',
    'COMPLETING'
);


--
-- Name: WorkerAnnualHourlyPay; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerAnnualHourlyPay" AS ENUM (
    'Hourly',
    'Annually',
    'Don''t know'
);


--
-- Name: WorkerApprenticeshipTraining; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerApprenticeshipTraining" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerApprovedMentalHealthWorker; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerApprovedMentalHealthWorker" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerAuditChangeType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerAuditChangeType" AS ENUM (
    'created',
    'updated',
    'saved',
    'changed',
    'deleted',
    'wdfEligible'
);


--
-- Name: WorkerBritishCitizenship; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerBritishCitizenship" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerCareCertificate; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerCareCertificate" AS ENUM (
    'Yes, completed',
    'Yes, in progress or partially completed',
    'No'
);


--
-- Name: WorkerContract; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerContract" AS ENUM (
    'Permanent',
    'Temporary',
    'Pool/Bank',
    'Agency',
    'Other'
);


--
-- Name: WorkerCountryOfBirth; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerCountryOfBirth" AS ENUM (
    'United Kingdom',
    'Other',
    'Don''t know'
);


--
-- Name: WorkerDaysSick; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerDaysSick" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerDisability; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerDisability" AS ENUM (
    'Yes',
    'No',
    'Undisclosed',
    'Don''t know'
);


--
-- Name: WorkerGender; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerGender" AS ENUM (
    'Female',
    'Male',
    'Other',
    'Don''t know'
);


--
-- Name: WorkerNationality; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerNationality" AS ENUM (
    'British',
    'Other',
    'Don''t know'
);


--
-- Name: WorkerOtherJobs; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerOtherJobs" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerOtherQualifications; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerOtherQualifications" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerQualificationInSocialCare; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerQualificationInSocialCare" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerRecruitedFrom; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerRecruitedFrom" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerSocialCareStartDate; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerSocialCareStartDate" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerTrainingAccreditation; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerTrainingAccreditation" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: WorkerWeeklyHoursAverage; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerWeeklyHoursAverage" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerWeeklyHoursContracted; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerWeeklyHoursContracted" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerYearArrived; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerYearArrived" AS ENUM (
    'Yes',
    'No'
);


--
-- Name: WorkerZeroHoursContract; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."WorkerZeroHoursContract" AS ENUM (
    'Yes',
    'No',
    'Don''t know'
);


--
-- Name: bulkUploadStates; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."bulkUploadStates" AS ENUM (
    'READY',
    'DOWNLOADING',
    'UPLOADING',
    'UPLOADED',
    'VALIDATING',
    'FAILED',
    'WARNINGS',
    'PASSED',
    'COMPLETING'
);


--
-- Name: enum_Approvals_ApprovalType; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."enum_Approvals_ApprovalType" AS ENUM (
    'BecomeAParent',
    'CqcStatusChange'
);


--
-- Name: enum_Approvals_Status; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc."enum_Approvals_Status" AS ENUM (
    'Pending',
    'Approved',
    'Rejected'
);


--
-- Name: est_employertype_enum; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.est_employertype_enum AS ENUM (
    'Private Sector',
    'Voluntary / Charity',
    'Other',
    'Local Authority (generic/other)',
    'Local Authority (adult services)'
);


--
-- Name: establishment_data_access_permission; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.establishment_data_access_permission AS ENUM (
    'Workplace and Staff',
    'Workplace',
    'None'
);


--
-- Name: establishment_owner; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.establishment_owner AS ENUM (
    'Workplace',
    'Parent'
);


--
-- Name: establishment_parent_access_permission; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.establishment_parent_access_permission AS ENUM (
    'Workplace',
    'Workplace and Staff'
);


--
-- Name: job_declaration; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.job_declaration AS ENUM (
    'None',
    'Don''t know',
    'With Jobs'
);


--
-- Name: job_type; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.job_type AS ENUM (
    'Vacancies',
    'Starters',
    'Leavers'
);


--
-- Name: ownerchangestatus; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.ownerchangestatus AS ENUM (
    'REQUESTED',
    'APPROVED',
    'DENIED',
    'CANCELLED'
);


--
-- Name: user_role; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.user_role AS ENUM (
    'Read',
    'Edit',
    'Admin'
);


--
-- Name: worker_registerednurses_enum; Type: TYPE; Schema: cqc; Owner: -
--

CREATE TYPE cqc.worker_registerednurses_enum AS ENUM (
    'Adult Nurse',
    'Mental Health Nurse',
    'Learning Disabilities Nurse',
    'Children''s Nurse',
    'Enrolled Nurse'
);


--
-- Name: establishlmentidfromnmdsid(character varying); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.establishlmentidfromnmdsid(_nmdsid character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
	establishmentID INTEGER;
BEGIN
  select "EstablishmentID" from cqc."Establishment" where "NmdsID" ilike '%'||_nmdsid||'%' into establishmentID;
  return establishmentID;
END;
$$;


--
-- Name: establishlmentidfromtribalid(integer); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.establishlmentidfromtribalid(_tribalid integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
	establishmentID INTEGER;
BEGIN
  select "EstablishmentID" from cqc."Establishment" where "TribalID"=_tribalID into establishmentID;
  return establishmentID;
END;
$$;


--
-- Name: localauthorityreport(integer, date, date); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.localauthorityreport(establishmentid integer, reportfrom date, reportto date) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	success BOOLEAN;
	v_error_msg TEXT;
	v_error_stack TEXT;
	establishmentReportStatus BOOLEAN;
	workerReportStatus BOOLEAN;
BEGIN
	success := true;

	RAISE NOTICE 'localAuthorityReport (%) from % to %', establishmentID, reportFrom, reportTo;

	-- first delete all Local Authority report data related to this establishment
	DELETE FROM cqc."LocalAuthorityReportWorker" WHERE "EstablishmentFK"=establishmentID;
	DELETE FROM cqc."LocalAuthorityReportEstablishment" WHERE "EstablishmentFK"=establishmentID;

	SELECT cqc.localAuthorityReportWorker(establishmentID, reportFrom, reportTo) INTO workerReportStatus;
	SELECT cqc.localAuthorityReportEstablishment(establishmentID, reportFrom, reportTo) INTO establishmentReportStatus;


	IF NOT (establishmentReportStatus AND workerReportStatus) THEN
		success := false;
	END IF;

	RETURN success;

	EXCEPTION WHEN OTHERS THEN
		GET STACKED DIAGNOSTICS v_error_stack=PG_EXCEPTION_CONTEXT, v_error_msg=MESSAGE_TEXT;
		RAISE WARNING 'localAuthorityReport: %: %', v_error_msg, v_error_stack;
		RETURN false;

END; $$;


--
-- Name: localauthorityreportadmin(date, date); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.localauthorityreportadmin(reportfrom date, reportto date) RETURNS TABLE("LocalAuthority" text, "WorkplaceName" text, "WorkplaceID" text, "PrimaryEstablishmentID" integer, "LastYearsConfirmedNumbers" integer, "LatestUpdate" date, "WorkplacesCompleted" bigint, "StaffCompleted" bigint, "NumberOfWorkplaces" bigint, "NumberOfWorkplacesCompleted" bigint, "CountEstablishmentType" bigint, "CountMainService" bigint, "CountServiceUserGroups" bigint, "CountCapacity" bigint, "CountUiltisation" bigint, "CountNumberOfStaff" bigint, "CountVacancies" bigint, "CountStarters" bigint, "CountLeavers" bigint, "SumStaff" bigint, "CountIndividualStaffRecords" bigint, "CountOfIndividualStaffRecordsNotAgency" bigint, "CountOfIndividualStaffRecordsNotAgencyComplete" bigint, "PercentageNotAgencyComplete" numeric, "CountOfIndividualStaffRecordsAgency" bigint, "CountOfIndividualStaffRecordsAgencyComplete" bigint, "PercentageAgencyComplete" numeric, "CountOfGender" bigint, "CountOfDateOfBirth" bigint, "CountOfEthnicity" bigint, "CountOfMainJobRole" bigint, "CountOfEmploymentStatus" bigint, "CountOfContractedAverageHours" bigint, "CountOfSickness" bigint, "CountOfPay" bigint, "CountOfQualification" bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
	success BOOLEAN;
	v_error_msg TEXT;
	v_error_stack TEXT;
	AllLaEstablishments REFCURSOR;
	CurrentEstablishment RECORD;
BEGIN
	success := true;

	OPEN AllLaEstablishments FOR
	SELECT MyLocalAuthorities."LocalAuthority", MyLocalAuthorities."NmdsID", "Establishment"."EstablishmentID", "LAEstablishment"."WorkplaceName", "LAEstablishment"."WorkplaceID"
	FROM (
		VALUES
			('Barking & Dagenham','G100283', 409),
			('Barnet','G109436', 327),
			('Barnsley','J115228', 445),
			('Bath and North East Somerset','D238068', 60),
			('Bedford','I236353', 597),
			('Bexley','G112580', 271),
			('Birmingham','E200127', 1838),
			('Blackburn with Darwen','F92383', 283),
			('Blackpool','F194727', 652),
			('Bolton','F134107', 684),
			('Bracknell Forest','H114435', 314),
			('Bradford','J139447', 1533),
			('Brent','G233567', 355),
			('Brighton & Hove','H102995', 857),
			('Bristol','D231967', 1057),
			('Bromley','G114788', 337),
			('Buckinghamshire','H235947', 624),
			('Bury','F105233', 539),
			('Calderdale','J114267', 676),
			('Cambridgeshire','I156828', 1035),
			('Camden','G110402', 402),
			('Central Bedfordshire','I174567', 626),
			('Cheshire East','F227307', 1070),
			('Cheshire West and Chester','F107121', 533),
			('City of London','G232387', 19),
			('Cornwall','D114992', 1037),
			('Coventry','E178967', 845),
			('Croydon','G158292', 705),
			('Cumbria','F181827', 2627),
			('Darlington','B10784', 204),
			('Derby','C104755', 609),
			('Derbyshire','C107021', 3714),
			('Devon','D107716', 1327),
			('Doncaster','J106920', 706),
			('Dorset','D227879', 594),
			('Dudley','E104880', 844),
			('Durham','B104830', 807),
			('Ealing','G251344', 444),
			('East Riding of Yorkshire','J228012', 1179),
			('East Sussex','H105090', 1603),
			('Enfield','G174087', 221),
			('Essex','I100769', 1120),
			('Gateshead','B108334', 720),
			('Gloucestershire','D51188', 1075),
			('Greenwich','G231414', 490),
			('Hackney','G122327', 576),
			('Halton','F131587', 1096),
			('Hammersmith & Fulham','G104757', 255),
			('Hampshire','H228327', 3582),
			('Haringey','G104471', 274),
			('Harrow','G246107', 350),
			('Hartlepool','B102671', 301),
			('Havering','G247910', 251),
			('Herefordshire','E141307', 277),
			('Hertfordshire','I102895', 2214),
			('Hillingdon','G102559', 336),
			('Hounslow','G103425', 650),
			('Isle of Wight','H129207', 667),
			('Isles of Scilly','D233649', 31),
			('Islington','G251598', 451),
			('Kensington & Chelsea','G210367', 279),
			('Kent','H108087', 3267),
			('Kingston-upon-Hull','J233376', 836),
			('Kingston-Upon-Thames','G173768', 166),
			('Kirklees','J100346', 1268),
			('Knowsley','F138807', 365),
			('Lambeth','G107515', 495),
			('Lancashire','F144667', 3744),
			('Leeds','J206148', 1477),
			('Leicester','C105021', 760),
			('Leicestershire','C104324', 1239),
			('Lewisham','G238960', 409),
			('Lincolnshire','C235693', 723),
			('Liverpool','F112420', 1100),
			('Luton','I169167', 517),
			('Manchester','F92068', 1940),
			('Medway','H120367', 249),
			('Merton','G179107', 320),
			('Middlesbrough','B116107', 391),
			('Milton Keynes','H104058', 662),
			('Newcastle-upon-Tyne','B115867', 898),
			('Newham','G247772', 418),
			('Norfolk','I107881', 3002),
			('North East Lincolnshire','J251291', 1),
			('North Lincolnshire','J134007', 509),
			('North Somerset','D115028', 323),
			('North Tyneside','B136247', 529),
			('North Yorkshire','J113547', 2423),
			('Northamptonshire','C106716', 1438),
			('Northumberland','B106802', 509),
			('Nottingham','C100004', 1059),
			('Nottinghamshire','C31061', 1894),
			('Oldham','F92140', 251),
			('Oxfordshire','H134847', 848),
			('Peterborough','I161067', 202),
			('Plymouth','D112677', 230),
			('Bournemouth Christchurch and Poole','D51078', 767),
			('Portsmouth','H123527', 739),
			('Reading','H107691', 302),
			('Redbridge','G102939', 375),
			('Redcar & Cleveland','B103244', 368),
			('Richmond-upon-Thames','G102074', 294),
			('Rochdale','F92427', 389),
			('Rotherham','J116648', 752),
			('Rutland','C232251', 104),
			('Salford','F105473', 180),
			('Sandwell','E160467', 889),
			('Sefton','F121567', 345),
			('Sheffield','J109224', 1224),
			('Shropshire','E245728', 687),
			('Slough','H102664', 298),
			('Solihull','E233120', 483),
			('Somerset','D148447', 426),
			('South Gloucestershire','D108414', 555),
			('South Tyneside','B174687', 255),
			('Southampton','H158538', 515),
			('Southend-on-Sea','I174667', 244),
			('Southwark','G166348', 455),
			('St Helens','F105698', 699),
			('Staffordshire','E109339', 684),
			('Stockport','F92250', 656),
			('Stockton-on-Tees','B117463', 591),
			('Stoke-on-Trent','E100715', 719),
			('Suffolk','I105347', 1242),
			('Sunderland','B104660', 284),
			('Surrey','H129567', 2403),
			('Sutton','G106959', 239),
			('Swindon','D109088', 494),
			('Tameside','F108511', 643),
			('Telford & Wrekin','E207567', 627),
			('Thurrock','I125827', 579),
			('Torbay','D253007', 17),
			('Tower Hamlets','G106537', 454),
			('Trafford','F112554', 441),
			('Wakefield','J112649', 1005),
			('Walsall','E122167', 395),
			('Waltham Forest','G104057', 376),
			('Wandsworth','G108652', 412),
			('Warrington','F103037', 492),
			('Warwickshire','E251688', 702),
			('West Berkshire','H117047', 489),
			('West Sussex','H237687', 1159),
			('Westminster','G105680', 441),
			('Wigan','B10756', 1181),
			('Wiltshire','D119247', 640),
			('Windsor & Maidenhead','H112607', 6),
			('Wirral','F102294', 68),
			('Wokingham','H106740', 88),
			('Wolverhampton','E118530', 508),
			('Worcestershire','E235582', 1045),
			('York','J161268', 359),
			('Wozziland', 'G1001020', 0),
			('Wozziland2', 'G1001010', 0),
			('Jackieland', 'J1001074', 111),
			('Anniland', 'E1001272', 222)
		) AS MyLocalAuthorities ("LocalAuthority", "NmdsID", "LastYears")
			LEFT JOIN cqc."Establishment" on "Establishment"."NmdsID" = MyLocalAuthorities."NmdsID"
			LEFT JOIN cqc."LocalAuthorityReportEstablishment" AS "LAEstablishment" on "LAEstablishment"."WorkplaceID" = MyLocalAuthorities."NmdsID";


	-- first, run through and generate all Local Authority user reports - NOW
	LOOP
		FETCH AllLaEstablishments INTO CurrentEstablishment;
		EXIT WHEN NOT FOUND;

  		IF CurrentEstablishment."EstablishmentID" IS NOT NULL THEN
  			PERFORM cqc.localAuthorityReport(CurrentEstablishment."EstablishmentID", reportFrom, reportTo);
  		END IF;
	END LOOP;

	-- now report against all those generated user reports
	RETURN QUERY SELECT
		MyLocalAuthorities."LocalAuthority",
		regexp_replace(LAEstablishments."WorkplaceName", ',', '', 'g') AS "WorkplaceName",
		LAEstablishments."WorkplaceID",
		LAEstablishments."EstablishmentFK" AS "PrimaryEstablishmentID",
		MyLocalAuthorities."LastYears",	-- 5
		CASE WHEN max(LAEstablishments2."LastUpdatedDate") > max(LAWorkers."LastUpdated") THEN max(LAEstablishments2."LastUpdatedDate") ELSE max(LAWorkers."LastUpdated") END AS "LatestUpdate",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."WorkplaceComplete" = true) AS "WorkplacesCompleted",
		sum(LAWorkers."CountIndividualStaffRecordsCompleted")::BIGINT AS "StaffCompleted",
		count(LAEstablishments2."WorkplaceID") AS "NumberOfWorkplaces",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."WorkplaceComplete" = true) AS "NumberOfWorkplacesCompleted",	-- 10
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE SUBSTRING(LAEstablishments2."EstablishmentType" from 1 for 15) = 'Local Authority') AS "CountEstablishmentType",
		count(LAEstablishments2."WorkplaceID") AS  "CountMainService",			-- main service is mandatory
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."ServiceUserGroups" <> 'Missing') AS  "CountServiceUserGroups",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."CapacityOfMainService" <> 'Missing') AS  "CountCapacity",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."UtilisationOfMainService" <> 'Missing') AS  "CountUiltisation",	-- 15
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."NumberOfStaffRecords" <> 'Missing') AS  "CountNumberOfStaff",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."NumberOfVacancies" <> 'Missing') AS  "CountVacancies",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."NumberOfStarters" <> 'Missing') AS  "CountStarters",
		count(LAEstablishments2."WorkplaceID") FILTER (WHERE LAEstablishments2."NumberOfLeavers" <> 'Missing') AS  "CountLeavers",
		sum(LAEstablishments2."NumberOfStaffRecords"::INTEGER) FILTER (WHERE LAEstablishments2."NumberOfStaffRecords" <> 'Missing') AS  "SumStaff",	-- 20
		sum(LAWorkers."CountIndividualStaffRecords")::BIGINT AS "CountIndividualStaffRecords",
		sum(LAWorkers."CountOfIndividualStaffRecordsNotAgency")::BIGINT AS "CountOfIndividualStaffRecordsNotAgency",
		sum(LAWorkers."CountOfIndividualStaffRecordsNotAgencyComplete")::BIGINT AS "CountOfIndividualStaffRecordsNotAgencyComplete",
		sum(LAWorkers."PercentageNotAgencyComplete")::NUMERIC AS "PercentageNotAgencyComplete",
		sum(LAWorkers."CountOfIndividualStaffRecordsAgency")::BIGINT AS "CountOfIndividualStaffRecordsAgency",	-- 25
		sum(LAWorkers."CountOfIndividualStaffRecordsAgencyComplete")::BIGINT AS "CountOfIndividualStaffRecordsAgencyComplete",
		sum(LAWorkers."PercentageAgencyComplete")::NUMERIC AS "PercentageAgencyComplete",
		sum(LAWorkers."CountOfGender")::BIGINT AS "CountOfGender",
		sum(LAWorkers."CountOfDateOfBirth")::BIGINT AS "CountOfDateOfBirth",
		sum(LAWorkers."CountOfEthnicity")::BIGINT AS "CountOfEthnicity",	-- 30
		sum(LAWorkers."CountOfMainJobRole")::BIGINT AS "CountOfMainJobRole",
		sum(LAWorkers."CountOfEmploymentStatus")::BIGINT AS "CountOfEmploymentStatus",
		sum(LAWorkers."CountOfContractedAverageHours")::BIGINT AS "CountOfContractedAverageHours",
		sum(LAWorkers."CountOfSickness")::BIGINT AS "CountOfSickness",
		sum(LAWorkers."CountOfPay")::BIGINT AS "CountOfPay",	-- 35
		sum(LAWorkers."CountOfQualification")::BIGINT AS "CountOfQualification"
	FROM (
		VALUES
		('Barking & Dagenham','G100283', 409),
        			('Barnet','G109436', 327),
        			('Barnsley','J115228', 445),
        			('Bath and North East Somerset','D238068', 60),
        			('Bedford','I236353', 597),
        			('Bexley','G112580', 271),
        			('Birmingham','E200127', 1838),
        			('Blackburn with Darwen','F92383', 283),
        			('Blackpool','F194727', 652),
        			('Bolton','F134107', 684),
        			('Bracknell Forest','H114435', 314),
        			('Bradford','J139447', 1533),
        			('Brent','G233567', 355),
        			('Brighton & Hove','H102995', 857),
        			('Bristol','D231967', 1057),
        			('Bromley','G114788', 337),
        			('Buckinghamshire','H235947', 624),
        			('Bury','F105233', 539),
        			('Calderdale','J114267', 676),
        			('Cambridgeshire','I156828', 1035),
        			('Camden','G110402', 402),
        			('Central Bedfordshire','I174567', 626),
        			('Cheshire East','F227307', 1070),
        			('Cheshire West and Chester','F107121', 533),
        			('City of London','G232387', 19),
        			('Cornwall','D114992', 1037),
        			('Coventry','E178967', 845),
        			('Croydon','G158292', 705),
        			('Cumbria','F181827', 2627),
        			('Darlington','B10784', 204),
        			('Derby','C104755', 609),
        			('Derbyshire','C107021', 3714),
        			('Devon','D107716', 1327),
        			('Doncaster','J106920', 706),
        			('Dorset','D227879', 594),
        			('Dudley','E104880', 844),
        			('Durham','B104830', 807),
        			('Ealing','G251344', 444),
        			('East Riding of Yorkshire','J228012', 1179),
        			('East Sussex','H105090', 1603),
        			('Enfield','G174087', 221),
        			('Essex','I100769', 1120),
        			('Gateshead','B108334', 720),
        			('Gloucestershire','D51188', 1075),
        			('Greenwich','G231414', 490),
        			('Hackney','G122327', 576),
        			('Halton','F131587', 1096),
        			('Hammersmith & Fulham','G104757', 255),
        			('Hampshire','H228327', 3582),
        			('Haringey','G104471', 274),
        			('Harrow','G246107', 350),
        			('Hartlepool','B102671', 301),
        			('Havering','G247910', 251),
        			('Herefordshire','E141307', 277),
        			('Hertfordshire','I102895', 2214),
        			('Hillingdon','G102559', 336),
        			('Hounslow','G103425', 650),
        			('Isle of Wight','H129207', 667),
        			('Isles of Scilly','D233649', 31),
        			('Islington','G251598', 451),
        			('Kensington & Chelsea','G210367', 279),
        			('Kent','H108087', 3267),
        			('Kingston-upon-Hull','J233376', 836),
        			('Kingston-Upon-Thames','G173768', 166),
        			('Kirklees','J100346', 1268),
        			('Knowsley','F138807', 365),
        			('Lambeth','G107515', 495),
        			('Lancashire','F144667', 3744),
        			('Leeds','J206148', 1477),
        			('Leicester','C105021', 760),
        			('Leicestershire','C104324', 1239),
        			('Lewisham','G238960', 409),
        			('Lincolnshire','C235693', 723),
        			('Liverpool','F112420', 1100),
        			('Luton','I169167', 517),
        			('Manchester','F92068', 1940),
        			('Medway','H120367', 249),
        			('Merton','G179107', 320),
        			('Middlesbrough','B116107', 391),
        			('Milton Keynes','H104058', 662),
        			('Newcastle-upon-Tyne','B115867', 898),
        			('Newham','G247772', 418),
        			('Norfolk','I107881', 3002),
        			('North East Lincolnshire','J251291', 1),
        			('North Lincolnshire','J134007', 509),
        			('North Somerset','D115028', 323),
        			('North Tyneside','B136247', 529),
        			('North Yorkshire','J113547', 2423),
        			('Northamptonshire','C106716', 1438),
        			('Northumberland','B106802', 509),
        			('Nottingham','C100004', 1059),
        			('Nottinghamshire','C31061', 1894),
        			('Oldham','F92140', 251),
        			('Oxfordshire','H134847', 848),
        			('Peterborough','I161067', 202),
        			('Plymouth','D112677', 230),
        			('Bournemouth Christchurch and Poole','D51078', 767),
        			('Portsmouth','H123527', 739),
        			('Reading','H107691', 302),
        			('Redbridge','G102939', 375),
        			('Redcar & Cleveland','B103244', 368),
        			('Richmond-upon-Thames','G102074', 294),
        			('Rochdale','F92427', 389),
        			('Rotherham','J116648', 752),
        			('Rutland','C232251', 104),
        			('Salford','F105473', 180),
        			('Sandwell','E160467', 889),
        			('Sefton','F121567', 345),
        			('Sheffield','J109224', 1224),
        			('Shropshire','E245728', 687),
        			('Slough','H102664', 298),
        			('Solihull','E233120', 483),
        			('Somerset','D148447', 426),
        			('South Gloucestershire','D108414', 555),
        			('South Tyneside','B174687', 255),
        			('Southampton','H158538', 515),
        			('Southend-on-Sea','I174667', 244),
        			('Southwark','G166348', 455),
        			('St Helens','F105698', 699),
        			('Staffordshire','E109339', 684),
        			('Stockport','F92250', 656),
        			('Stockton-on-Tees','B117463', 591),
        			('Stoke-on-Trent','E100715', 719),
        			('Suffolk','I105347', 1242),
        			('Sunderland','B104660', 284),
        			('Surrey','H129567', 2403),
        			('Sutton','G106959', 239),
        			('Swindon','D109088', 494),
        			('Tameside','F108511', 643),
        			('Telford & Wrekin','E207567', 627),
        			('Thurrock','I125827', 579),
        			('Torbay','D253007', 17),
        			('Tower Hamlets','G106537', 454),
        			('Trafford','F112554', 441),
        			('Wakefield','J112649', 1005),
        			('Walsall','E122167', 395),
        			('Waltham Forest','G104057', 376),
        			('Wandsworth','G108652', 412),
        			('Warrington','F103037', 492),
        			('Warwickshire','E251688', 702),
        			('West Berkshire','H117047', 489),
        			('West Sussex','H237687', 1159),
        			('Westminster','G105680', 441),
        			('Wigan','B10756', 1181),
        			('Wiltshire','D119247', 640),
        			('Windsor & Maidenhead','H112607', 6),
        			('Wirral','F102294', 68),
        			('Wokingham','H106740', 88),
        			('Wolverhampton','E118530', 508),
        			('Worcestershire','E235582', 1045),
        			('York','J161268', 359),
        			('Wozziland', 'G1001020', 0),
        			('Wozziland2', 'G1001010', 0),
        			('Jackieland', 'J1001074', 111),
        			('Anniland', 'E1001272', 222)
		) AS MyLocalAuthorities ("LocalAuthority", "NmdsID", "LastYears")
	INNER JOIN cqc."LocalAuthorityReportEstablishment" LAEstablishments on LAEstablishments."WorkplaceID" = MyLocalAuthorities."NmdsID"
	INNER JOIN cqc."LocalAuthorityReportEstablishment" LAEstablishments2 on LAEstablishments2."EstablishmentFK" = LAEstablishments."EstablishmentFK"
	LEFT JOIN (
		SELECT
			"WorkplaceFK",
			max("LastUpdated") AS "LastUpdated",
			count(LAWorkers2."MainJob") AS  "CountIndividualStaffRecords",
			count(LAWorkers2."MainJob") FILTER (WHERE LAWorkers2."StaffRecordComplete" = true)  AS  "CountIndividualStaffRecordsCompleted",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."EmploymentStatus" <> 'Agency') AS  "CountOfIndividualStaffRecordsNotAgency",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."EmploymentStatus" <> 'Agency' AND LAWorkers2."StaffRecordComplete" = true) AS  "CountOfIndividualStaffRecordsNotAgencyComplete",
			0.00::NUMERIC AS "PercentageNotAgencyComplete",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."EmploymentStatus" = 'Agency') AS  "CountOfIndividualStaffRecordsAgency",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."EmploymentStatus" = 'Agency'  AND LAWorkers2."StaffRecordComplete" = true) AS  "CountOfIndividualStaffRecordsAgencyComplete",
			0.00::NUMERIC AS "PercentageAgencyComplete",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."Gender" <> 'Missing') AS  "CountOfGender",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."DateOfBirth" <> 'Missing') AS  "CountOfDateOfBirth",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."Ethnicity" <> 'Missing') AS  "CountOfEthnicity",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."MainJob" <> 'Missing') AS  "CountOfMainJobRole",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."EmploymentStatus" <> 'Missing') AS  "CountOfEmploymentStatus",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."ContractedAverageHours" <> 'Missing') AS  "CountOfContractedAverageHours",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."SickDays" <> 'Missing') AS  "CountOfSickness",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."PayInterval" <> 'Missing' AND LAWorkers2."RateOfPay" <> 'Missing') AS  "CountOfPay",
			count(LAWorkers2."EmploymentStatus") FILTER (WHERE LAWorkers2."RelevantSocialCareQualification" <> 'Missing' AND LAWorkers2."HighestSocialCareQualification" <> 'Missing' AND LAWorkers2."NonSocialCareQualification" <> 'Missing') AS  "CountOfQualification"
		FROM cqc."LocalAuthorityReportWorker" LAWorkers2
		group by LAWorkers2."WorkplaceFK"
	) LAWorkers ON LAWorkers."WorkplaceFK" = LAEstablishments2."WorkplaceFK"
	GROUP BY
 		MyLocalAuthorities."LocalAuthority",
 		LAEstablishments."WorkplaceName",
 		LAEstablishments."WorkplaceID",
 		LAEstablishments."EstablishmentFK",
		MyLocalAuthorities."LastYears"
	ORDER BY MyLocalAuthorities."LocalAuthority", LAEstablishments."WorkplaceName";

END;
$$;


--
-- Name: localauthorityreportestablishment(integer, date, date); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.localauthorityreportestablishment(establishmentid integer, reportfrom date, reportto date) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
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

END; $$;


--
-- Name: localauthorityreportworker(integer, date, date); Type: FUNCTION; Schema: cqc; Owner: -
--

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


--
-- Name: maxqualifications(integer); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.maxqualifications(primaryestablishmentid integer) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
  MAX_QUALS BIGINT := 0;
BEGIN
  SELECT max("NumberOfQuals") AS "MaximumNumberOfQualifications"
  FROM (
    SELECT
      "WorkerFK", count("WorkerQualifications"."ID") AS "NumberOfQuals"
    FROM
      cqc."Establishment"
        INNER JOIN cqc."Worker"
          INNER JOIN cqc."WorkerQualifications" ON "WorkerQualifications"."WorkerFK" = "Worker"."ID"
          ON "Worker"."EstablishmentFK" = "Establishment"."EstablishmentID"
    WHERE
        "Establishment"."EstablishmentID" = primaryEstablishmentId OR ("Establishment"."ParentID" = primaryEstablishmentId AND "Establishment"."DataOwner"='Parent' AND "Establishment"."Archived" = false)
      AND "Worker"."Archived"=false
    GROUP BY
      "WorkerFK"
  ) AllQuals INTO MAX_QUALS;

  -- a minimum always of 3
  IF MAX_QUALS IS NULL OR MAX_QUALS < 3 THEN
    MAX_QUALS := 3;
  END IF;

  return MAX_QUALS;

END; $$;


--
-- Name: purgeestablishlment(integer); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.purgeestablishlment(_estid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  delete from cqc."WorkerQualifications" where "WorkerFK" in (select distinct "ID" from cqc."Worker" where "EstablishmentFK"=_estId);
  delete from cqc."WorkerTraining" where "WorkerFK" in (select distinct "ID" from cqc."Worker" where "EstablishmentFK"=_estId);
  delete from cqc."WorkerAudit" where "WorkerFK" in (select distinct "ID" from cqc."Worker" where "EstablishmentFK"=_estId);
  delete from cqc."WorkerJobs" where "WorkerFK" in (select distinct "ID" from cqc."Worker" where "EstablishmentFK"=_estId);
  delete from cqc."Worker" where "EstablishmentFK"=_estId;
  delete from cqc."EstablishmentCapacity" where "EstablishmentID"=_estId;
  delete from cqc."EstablishmentJobs" where "EstablishmentID"=_estId;
  delete from cqc."EstablishmentServices" where "EstablishmentID"=_estId;
  delete from cqc."EstablishmentLocalAuthority" where "EstablishmentID"=_estId;
  delete from cqc."EstablishmentServiceUsers" where "EstablishmentID"=_estId;

  delete from cqc."Login" where "RegistrationID" in (select distinct "RegistrationID" from cqc."User" where "EstablishmentID"=_estId);
  delete from cqc."UserAudit" where "UserFK" in (select distinct "RegistrationID" from cqc."User" where "EstablishmentID"=_estId);
  delete from cqc."PasswdResetTracking" where "UserFK" in (select distinct "RegistrationID" from cqc."User" where "EstablishmentID"=_estId);
  delete from cqc."User" where "EstablishmentID"=_estId;
  delete from cqc."EstablishmentAudit" where "EstablishmentFK"=_estId;
  delete from cqc."Establishment" where "EstablishmentID"=_estId;
END;
$$;


--
-- Name: wdfsummaryreport(date); Type: FUNCTION; Schema: cqc; Owner: -
--

CREATE FUNCTION cqc.wdfsummaryreport(effectivedate date) RETURNS TABLE("NmdsID" text, "EstablishmentID" integer, "EstablishmentName" text, "Address1" text, "Address2" text, "PostCode" text, "Region" text, "CSSR" text, "EstablishmentUpdated" timestamp without time zone, "NumberOfStaff" integer, "ParentID" integer, "OverallWdfEligibility" timestamp without time zone, "ParentNmdsID" text, "ParentEstablishmentID" integer, "ParentName" text, "WorkerCount" bigint, "WorkerCompletedCount" bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
   RETURN QUERY select
	"Establishment"."NmdsID"::text,
	"Establishment"."EstablishmentID",
	"Establishment"."NameValue" AS "EstablishmentName",
	"Establishment"."Address1",
	"Establishment"."Address2",
	"Establishment"."PostCode",
	pcode.region as "Region",
	pcode.cssr as "CSSR",
	"Establishment".updated,
	"Establishment"."NumberOfStaffValue" AS "NumberOfStaff",
	"Establishment"."ParentID",
	"Establishment"."OverallWdfEligibility",
	parents."NmdsID"::text As "ParentNmdsID",
	parents."EstablishmentID" AS "ParentEstablishmentID",
	parents."NameValue" AS "ParentName",
	COUNT(workers."ID") filter (where workers."ID" is not null) as "WorkerCount",
    COUNT(workers."ID") filter (where workers."LastWdfEligibility" > effectiveDate) as "WorkerCompletedCount"
from cqc."Establishment"
	left join cqcref.pcode on pcode.postcode = "Establishment"."PostCode"
	left join cqc."Establishment" as parents on parents."EstablishmentID" = "Establishment"."ParentID"
	left join cqc."Worker" as workers on workers."EstablishmentFK" = "Establishment"."EstablishmentID" and workers."Archived"=false
where "Establishment"."Archived"=false
group by
	"Establishment"."NmdsID",
	"Establishment"."EstablishmentID",
	"Establishment"."NameValue",
	"Establishment"."Address1",
	"Establishment"."Address2",
	"Establishment"."PostCode",
	pcode.region,
	pcode.cssr,
	"Establishment".updated,
	"Establishment"."ParentID",
	"Establishment"."OverallWdfEligibility",
	parents."NmdsID",
	parents."EstablishmentID",
	parents."NameValue";
END; $$;


--
-- Name: create_pcode_data(); Type: FUNCTION; Schema: cqcref; Owner: -
--

CREATE FUNCTION cqcref.create_pcode_data() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN

  drop table if exists cqcref.pcode;

  CREATE TABLE cqcref.pcode AS
  select postcode, local_custodian_code
  from cqcref.pcodedata
  group by postcode, local_custodian_code;

  alter table cqcref.pcode add column postcode_part text;
  alter table cqcref.pcode add column region text;
  alter table cqcref.pcode add column cssr text;

  update cqcref.pcode
  set postcode_part = substring(postcode from 1 for position(' ' in postcode));

  update cqcref.pcode
  set region="Cssr"."Region", cssr="Cssr"."CssR"
  from cqc."Cssr" where "Cssr"."LocalCustodianCode" = pcode.local_custodian_code;

	CREATE INDEX "pcode_postcode" on cqcref.pcode (postcode);
  CREATE INDEX "pcode_postcode_PART" on cqcref.pcode (postcode_PART);

END;
$$;


SET default_tablespace = '';
SET default_with_oids = false;

--
-- Name: 20190819_wdf; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."20190819_wdf" (
    nmdsid text,
    tribalid integer,
    achieved text,
    achieveddate date
);


--
-- Name: AddUserTracking_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."AddUserTracking_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AddUserTracking; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."AddUserTracking" (
    "ID" integer DEFAULT nextval('cqc."AddUserTracking_seq"'::regclass) NOT NULL,
    "UserFK" integer NOT NULL,
    "Created" timestamp without time zone DEFAULT now() NOT NULL,
    "Expires" timestamp without time zone DEFAULT (now() + '3 days'::interval) NOT NULL,
    "AddUuid" uuid NOT NULL,
    "RegisteredBy" character varying(120) NOT NULL,
    "Completed" timestamp without time zone
);


--
-- Name: Approvals_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."Approvals_ID_seq"
    START WITH 26
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


--
-- Name: Approvals; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Approvals" (
    "ID" integer DEFAULT nextval('cqc."Approvals_ID_seq"'::regclass) NOT NULL,
    "UUID" uuid NOT NULL,
    "EstablishmentID" integer NOT NULL,
    "UserID" integer NOT NULL,
    "ApprovalType" cqc."enum_Approvals_ApprovalType",
    "Status" cqc."enum_Approvals_Status",
    "RejectionReason" text,
    "Data" json,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


--
-- Name: Country; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Country" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Country" text NOT NULL
);


--
-- Name: CqcLog; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."CqcLog" (
    id integer NOT NULL,
    success boolean,
    message character varying(255),
    createdat timestamp with time zone NOT NULL,
    "lastUpdatedAt" text
);


--
-- Name: Cssr; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Cssr" (
    "CssrID" integer NOT NULL,
    "CssR" text NOT NULL,
    "LocalAuthority" text NOT NULL,
    "LocalCustodianCode" integer NOT NULL,
    "Region" text NOT NULL,
    "RegionID" integer NOT NULL,
    "NmdsIDLetter" character(1) NOT NULL
);


--
-- Name: Establishment; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Establishment" (
    "EstablishmentID" integer NOT NULL,
    "NameValue" text NOT NULL,
    "Address1" text,
    "LocationID" text,
    "PostCode" text,
    "IsRegulated" boolean NOT NULL,
    "MainServiceFKValue" integer,
    "EmployerTypeValue" cqc.est_employertype_enum,
    "ShareDataWithCQC" boolean DEFAULT false,
    "ShareDataWithLA" boolean DEFAULT false,
    "ShareDataValue" boolean DEFAULT false,
    "NumberOfStaffValue" integer,
    "VacanciesValue" cqc.job_declaration,
    "StartersValue" cqc.job_declaration,
    "LeaversValue" cqc.job_declaration,
    "NmdsID" character(8) NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    updatedby character varying(120) DEFAULT 'admin'::character varying NOT NULL,
    "EstablishmentUID" uuid NOT NULL,
    "EmployerTypeSavedAt" timestamp without time zone,
    "EmployerTypeChangedAt" timestamp without time zone,
    "EmployerTypeSavedBy" character varying(120),
    "EmployerTypeChangedBy" character varying(120),
    "NumberOfStaffSavedAt" timestamp without time zone,
    "NumberOfStaffChangedAt" timestamp without time zone,
    "NumberOfStaffSavedBy" character varying(120),
    "NumberOfStaffChangedBy" character varying(120),
    "OtherServicesSavedAt" timestamp without time zone,
    "OtherServicesChangedAt" timestamp without time zone,
    "OtherServicesSavedBy" character varying(120),
    "OtherServicesChangedBy" character varying(120),
    "CapacityServicesSavedAt" timestamp without time zone,
    "CapacityServicesChangedAt" timestamp without time zone,
    "CapacityServicesSavedBy" character varying(120),
    "CapacityServicesChangedBy" character varying(120),
    "ShareDataSavedAt" timestamp without time zone,
    "ShareDataChangedAt" timestamp without time zone,
    "ShareDataSavedBy" character varying(120),
    "ShareDataChangedBy" character varying(120),
    "ShareWithLASavedAt" timestamp without time zone,
    "ShareWithLAChangedAt" timestamp without time zone,
    "ShareWithLASavedBy" character varying(120),
    "ShareWithLAChangedBy" character varying(120),
    "VacanciesSavedAt" timestamp without time zone,
    "VacanciesChangedAt" timestamp without time zone,
    "VacanciesSavedBy" character varying(120),
    "VacanciesChangedBy" character varying(120),
    "StartersSavedAt" timestamp without time zone,
    "StartersChangedAt" timestamp without time zone,
    "StartersSavedBy" character varying(120),
    "StartersChangedBy" character varying(120),
    "LeaversSavedAt" timestamp without time zone,
    "LeaversChangedAt" timestamp without time zone,
    "LeaversSavedBy" character varying(120),
    "LeaversChangedBy" character varying(120),
    "ServiceUsersSavedAt" timestamp without time zone,
    "ServiceUsersChangedAt" timestamp without time zone,
    "ServiceUsersSavedBy" character varying(120),
    "ServiceUsersChangedBy" character varying(120),
    "NameSavedAt" timestamp without time zone,
    "NameChangedAt" timestamp without time zone,
    "NameSavedBy" character varying(120),
    "NameChangedBy" character varying(120),
    "MainServiceFKSavedAt" timestamp without time zone,
    "MainServiceFKChangedAt" timestamp without time zone,
    "MainServiceFKSavedBy" character varying(120),
    "MainServiceFKChangedBy" character varying(120),
    "OverallWdfEligibility" timestamp without time zone,
    "LastWdfEligibility" timestamp without time zone,
    "TribalID" integer,
    "IsParent" boolean DEFAULT false,
    "ParentID" integer,
    "ParentUID" uuid,
    "DataOwner" cqc.establishment_owner DEFAULT 'Workplace'::cqc.establishment_owner NOT NULL,
    "DataPermissions" cqc.establishment_data_access_permission DEFAULT 'None'::cqc.establishment_data_access_permission,
    "EmployerTypeOther" text,
    "MainServiceFkOther" text,
    "Archived" boolean DEFAULT false,
    "DataSource" cqc."DataSource" DEFAULT 'Online'::cqc."DataSource",
    "LocalIdentifierValue" text,
    "LocalIdentifierSavedAt" timestamp without time zone,
    "LocalIdentifierSavedBy" text,
    "LocalIdentifierChangedAt" timestamp without time zone,
    "LocalIdentifierChangedBy" text,
    "LastBulkUploaded" timestamp without time zone,
    "ProvID" text,
    "Address2" text,
    "Address3" text,
    "Town" text,
    "County" text,
    "ReasonsForLeaving" text,
    "StaffWdfEligibility" timestamp without time zone,
    "EstablishmentWdfEligibility" timestamp without time zone,
    "DataOwnershipRequested" timestamp without time zone,
    "Status" character varying(20),
    "CurrentWdfEligibility" boolean,
    "bulkUploadLockHeld" boolean DEFAULT false NOT NULL,
    "bulkUploadState" cqc."bulkUploadStates" DEFAULT 'READY'::cqc."bulkUploadStates" NOT NULL,
    "WdfReportLockHeld" boolean DEFAULT false NOT NULL,
    "WdfReportState" cqc."WdfReportStates" DEFAULT 'READY'::cqc."WdfReportStates" NOT NULL,
    "LinkToParentRequested" timestamp without time zone,
    "TrainingReportLockHeld" boolean DEFAULT false NOT NULL,
    "TrainingReportState" cqc."TrainingReportStates" DEFAULT 'READY'::cqc."TrainingReportStates" NOT NULL,
    "LocationIdSavedAt" timestamp with time zone,
    "LocationIdChangedAt" timestamp with time zone,
    "LocationIdSavedBy" character varying(120),
    "LocationIdChangedBy" character varying(120),
    "Address1SavedAt" timestamp with time zone,
    "Address1ChangedAt" timestamp with time zone,
    "Address1SavedBy" character varying(120),
    "Address1ChangedBy" character varying(120),
    "Address2SavedAt" timestamp with time zone,
    "Address2ChangedAt" timestamp with time zone,
    "Address2SavedBy" character varying(120),
    "Address2ChangedBy" character varying(120),
    "Address3SavedAt" timestamp with time zone,
    "Address3ChangedAt" timestamp with time zone,
    "Address3SavedBy" character varying(120),
    "Address3ChangedBy" character varying(120),
    "TownSavedAt" timestamp with time zone,
    "TownChangedAt" timestamp with time zone,
    "TownSavedBy" character varying(120),
    "TownChangedBy" character varying(120),
    "CountySavedAt" timestamp with time zone,
    "CountyChangedAt" timestamp with time zone,
    "CountySavedBy" character varying(120),
    "CountyChangedBy" character varying(120),
    "PostcodeSavedAt" timestamp with time zone,
    "PostcodeChangedAt" timestamp with time zone,
    "PostcodeSavedBy" character varying(120),
    "PostcodeChangedBy" character varying(120),
    "IsRegulatedSavedAt" timestamp with time zone,
    "IsRegulatedChangedAt" timestamp with time zone,
    "IsRegulatedSavedBy" text,
    "IsRegulatedChangedBy" text,
    "LaReportLockHeld" boolean DEFAULT false NOT NULL
);


--
-- Name: EstablishmentAudit; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentAudit" (
    "ID" integer NOT NULL,
    "EstablishmentFK" integer NOT NULL,
    "Username" character varying(120) NOT NULL,
    "When" timestamp without time zone DEFAULT now() NOT NULL,
    "EventType" cqc."EstablishmentAuditChangeType" NOT NULL,
    "PropertyName" character varying(100),
    "ChangeEvents" jsonb
);


--
-- Name: EstablishmentAudit_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."EstablishmentAudit_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstablishmentAudit_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."EstablishmentAudit_ID_seq" OWNED BY cqc."EstablishmentAudit"."ID";


--
-- Name: EstablishmentCapacity; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentCapacity" (
    "EstablishmentCapacityID" integer NOT NULL,
    "EstablishmentID" integer,
    "ServiceCapacityID" integer NOT NULL,
    "Answer" integer
);


--
-- Name: EstablishmentCapacity_EstablishmentCapacityID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."EstablishmentCapacity_EstablishmentCapacityID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstablishmentCapacity_EstablishmentCapacityID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."EstablishmentCapacity_EstablishmentCapacityID_seq" OWNED BY cqc."EstablishmentCapacity"."EstablishmentCapacityID";


--
-- Name: EstablishmentJobs; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentJobs" (
    "JobID" integer NOT NULL,
    "EstablishmentID" integer NOT NULL,
    "EstablishmentJobID" integer NOT NULL,
    "JobType" cqc.job_type NOT NULL,
    "Total" integer NOT NULL
);


--
-- Name: EstablishmentJobs_EstablishmentJobID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."EstablishmentJobs_EstablishmentJobID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstablishmentJobs_EstablishmentJobID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."EstablishmentJobs_EstablishmentJobID_seq" OWNED BY cqc."EstablishmentJobs"."EstablishmentJobID";


--
-- Name: EstablishmentLocalAuthority; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentLocalAuthority" (
    "EstablishmentLocalAuthorityID" integer NOT NULL,
    "EstablishmentID" integer NOT NULL,
    "CssrID" integer NOT NULL,
    "CssR" text NOT NULL
);


--
-- Name: EstablishmentLocalAuthority_EstablishmentLocalAuthorityID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."EstablishmentLocalAuthority_EstablishmentLocalAuthorityID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstablishmentLocalAuthority_EstablishmentLocalAuthorityID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."EstablishmentLocalAuthority_EstablishmentLocalAuthorityID_seq" OWNED BY cqc."EstablishmentLocalAuthority"."EstablishmentLocalAuthorityID";


--
-- Name: EstablishmentMainServicesWithCapacitiesVW; Type: VIEW; Schema: cqc; Owner: -
--

CREATE VIEW cqc."EstablishmentMainServicesWithCapacitiesVW" AS
SELECT
    NULL::integer AS "EstablishmentID",
    NULL::bigint AS "CAPACITY",
    NULL::bigint AS "UTILISATION";


--
-- Name: EstablishmentServiceUsers; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentServiceUsers" (
    "EstablishmentID" integer NOT NULL,
    "ServiceUserID" integer NOT NULL,
    "Other" text
);


--
-- Name: EstablishmentServices; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."EstablishmentServices" (
    "EstablishmentID" integer NOT NULL,
    "ServiceID" integer NOT NULL,
    "Other" text
);


--
-- Name: Establishment_EstablishmentID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."Establishment_EstablishmentID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Establishment_EstablishmentID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."Establishment_EstablishmentID_seq" OWNED BY cqc."Establishment"."EstablishmentID";


--
-- Name: Ethnicity; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Ethnicity" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "EthnicityGroup" text NOT NULL,
    "Ethnicity" text NOT NULL
);


--
-- Name: Feedback_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."Feedback_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Feedback; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Feedback" (
    "FeedbackID" integer DEFAULT nextval('cqc."Feedback_seq"'::regclass) NOT NULL,
    "Doing" text NOT NULL,
    "Tellus" text NOT NULL,
    "Name" text,
    "Email" text,
    created timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: Job; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Job" (
    "JobID" integer NOT NULL,
    "JobName" text,
    "Other" boolean DEFAULT false
);


--
-- Name: LeaversVW; Type: VIEW; Schema: cqc; Owner: -
--

CREATE VIEW cqc."LeaversVW" AS
 SELECT "EstablishmentJobs"."EstablishmentJobID",
    "EstablishmentJobs"."EstablishmentID",
    "EstablishmentJobs"."JobID",
    "EstablishmentJobs"."JobType",
    "EstablishmentJobs"."Total"
   FROM cqc."EstablishmentJobs"
  WHERE ("EstablishmentJobs"."JobType" = 'Leavers'::cqc.job_type);


--
-- Name: LinkToParent; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."LinkToParent" (
    "LinkToParentUID" uuid NOT NULL,
    "ParentEstablishmentID" integer NOT NULL,
    "SubEstablishmentID" integer NOT NULL,
    "PermissionRequest" cqc.establishment_data_access_permission,
    "ApprovalStatus" cqc."LinkToParentStatus",
    "RejectionReason" text,
    "Created" timestamp without time zone DEFAULT now() NOT NULL,
    "CreatedByUserUID" uuid NOT NULL,
    "Updated" timestamp without time zone DEFAULT now() NOT NULL,
    "UpdatedByUserUID" uuid NOT NULL
);


--
-- Name: LocalAuthorityReportEstablishment; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."LocalAuthorityReportEstablishment" (
    "ID" integer NOT NULL,
    "ReportFrom" date NOT NULL,
    "ReportTo" date NOT NULL,
    "EstablishmentFK" integer NOT NULL,
    "WorkplaceFK" integer NOT NULL,
    "WorkplaceName" text NOT NULL,
    "WorkplaceID" text NOT NULL,
    "LastUpdatedDate" date NOT NULL,
    "EstablishmentType" text NOT NULL,
    "MainService" text NOT NULL,
    "ServiceUserGroups" text NOT NULL,
    "CapacityOfMainService" text NOT NULL,
    "UtilisationOfMainService" text NOT NULL,
    "NumberOfVacancies" text NOT NULL,
    "NumberOfStarters" text NOT NULL,
    "NumberOfLeavers" text NOT NULL,
    "NumberOfStaffRecords" text NOT NULL,
    "WorkplaceComplete" boolean,
    "NumberOfIndividualStaffRecords" text NOT NULL,
    "PercentageOfStaffRecords" numeric(10,1) NOT NULL,
    "NumberOfStaffRecordsNotAgency" integer NOT NULL,
    "NumberOfCompleteStaffNotAgency" integer NOT NULL,
    "PercentageOfCompleteStaffRecords" numeric(10,1) NOT NULL,
    "NumberOfAgencyStaffRecords" integer NOT NULL,
    "NumberOfCompleteAgencyStaffRecords" integer NOT NULL,
    "PercentageOfCompleteAgencyStaffRecords" numeric(10,1) NOT NULL
);


--
-- Name: LocalAuthorityReportEstablishment_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."LocalAuthorityReportEstablishment_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LocalAuthorityReportEstablishment_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."LocalAuthorityReportEstablishment_ID_seq" OWNED BY cqc."LocalAuthorityReportEstablishment"."ID";


--
-- Name: LocalAuthorityReportWorker; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."LocalAuthorityReportWorker" (
    "ID" integer NOT NULL,
    "EstablishmentFK" integer NOT NULL,
    "WorkplaceFK" integer NOT NULL,
    "WorkerFK" integer NOT NULL,
    "LocalID" text,
    "WorkplaceName" text NOT NULL,
    "WorkplaceID" text NOT NULL,
    "Gender" text NOT NULL,
    "DateOfBirth" text NOT NULL,
    "Ethnicity" text NOT NULL,
    "MainJob" text NOT NULL,
    "EmploymentStatus" text NOT NULL,
    "ContractedAverageHours" text NOT NULL,
    "SickDays" text NOT NULL,
    "PayInterval" text NOT NULL,
    "RateOfPay" text NOT NULL,
    "RelevantSocialCareQualification" text NOT NULL,
    "HighestSocialCareQualification" text NOT NULL,
    "NonSocialCareQualification" text NOT NULL,
    "LastUpdated" date NOT NULL,
    "StaffRecordComplete" boolean NOT NULL
);


--
-- Name: LocalAuthorityReportWorker_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."LocalAuthorityReportWorker_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LocalAuthorityReportWorker_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."LocalAuthorityReportWorker_ID_seq" OWNED BY cqc."LocalAuthorityReportWorker"."ID";


--
-- Name: Login; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Login" (
    "ID" integer NOT NULL,
    "RegistrationID" integer NOT NULL,
    "Username" character varying(120) NOT NULL,
    "Active" boolean NOT NULL,
    "InvalidAttempt" integer NOT NULL,
    "Hash" character varying(255),
    "FirstLogin" timestamp(4) without time zone,
    "LastLoggedIn" timestamp without time zone,
    "PasswdLastChanged" timestamp without time zone DEFAULT now() NOT NULL,
    "TribalHash" character varying(128),
    "TribalSalt" character varying(50),
    "Status" character varying(20),
    "AgreedUpdatedTerms" boolean DEFAULT false NOT NULL
);


--
-- Name: Login_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."Login_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Login_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."Login_ID_seq" OWNED BY cqc."Login"."ID";


--
-- Name: MandatoryTraining; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."MandatoryTraining" (
    "ID" integer NOT NULL,
    "EstablishmentFK" integer NOT NULL,
    "TrainingCategoryFK" integer NOT NULL,
    "JobFK" integer NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    "CreatedByUserUID" uuid NOT NULL,
    "UpdatedByUserUID" uuid NOT NULL
);


--
-- Name: MandatoryTraining_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."MandatoryTraining_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MandatoryTraining_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."MandatoryTraining_ID_seq" OWNED BY cqc."MandatoryTraining"."ID";


--
-- Name: Nationality; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Nationality" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Nationality" text NOT NULL
);


--
-- Name: NmdsID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."NmdsID_seq"
    AS integer
    START WITH 1001000
    INCREMENT BY 1
    MINVALUE 1001000
    MAXVALUE 9999999
    CACHE 1;


--
-- Name: Notifications; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Notifications" (
    "notificationUid" uuid NOT NULL,
    type cqc."NotificationType" NOT NULL,
    "typeUid" uuid NOT NULL,
    "recipientUserUid" uuid NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    "isViewed" boolean DEFAULT false,
    "createdByUserUID" uuid
);


--
-- Name: NurseSpecialism; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."NurseSpecialism" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Specialism" text NOT NULL,
    "Other" boolean DEFAULT false
);


--
-- Name: OwnerChangeRequest; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."OwnerChangeRequest" (
    "ownerChangeRequestUID" uuid NOT NULL,
    "subEstablishmentID" integer NOT NULL,
    "permissionRequest" cqc.establishment_data_access_permission,
    "approvalStatus" cqc.ownerchangestatus,
    "approvalReason" text,
    created timestamp without time zone DEFAULT now() NOT NULL,
    "createdByUserUID" uuid NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    "updatedByUserUID" uuid NOT NULL
);


--
-- Name: PasswdResetTracking_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."PasswdResetTracking_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PasswdResetTracking; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."PasswdResetTracking" (
    "ID" integer DEFAULT nextval('cqc."PasswdResetTracking_seq"'::regclass) NOT NULL,
    "UserFK" integer NOT NULL,
    "Created" timestamp without time zone DEFAULT now() NOT NULL,
    "Expires" timestamp without time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
    "ResetUuid" uuid NOT NULL,
    "Completed" timestamp without time zone
);


--
-- Name: Qualification; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Qualification" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Level" text NOT NULL
);


--
-- Name: Qualifications; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Qualifications" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Group" text NOT NULL,
    "Title" text NOT NULL,
    "Code" smallint NOT NULL,
    "From" date,
    "Until" date,
    "Level" character varying(2),
    "MultipleLevel" boolean NOT NULL,
    "RelevantToSocialCare" boolean NOT NULL,
    "AnalysisFileCode" character varying(20) NOT NULL
);


--
-- Name: RecruitedFrom; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."RecruitedFrom" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "From" text NOT NULL
);


--
-- Name: ServiceUsers; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."ServiceUsers" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "ServiceGroup" text NOT NULL,
    "Service" text NOT NULL,
    "Other" boolean DEFAULT false
);


--
-- Name: ServicesCapacity; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."ServicesCapacity" (
    "ServiceCapacityID" integer NOT NULL,
    "ServiceID" integer,
    "Question" text,
    "Sequence" integer,
    "Type" cqc."ServicesCapacityType" DEFAULT 'Capacity'::cqc."ServicesCapacityType"
);


--
-- Name: StartersVW; Type: VIEW; Schema: cqc; Owner: -
--

CREATE VIEW cqc."StartersVW" AS
 SELECT "EstablishmentJobs"."EstablishmentJobID",
    "EstablishmentJobs"."EstablishmentID",
    "EstablishmentJobs"."JobID",
    "EstablishmentJobs"."JobType",
    "EstablishmentJobs"."Total"
   FROM cqc."EstablishmentJobs"
  WHERE ("EstablishmentJobs"."JobType" = 'Starters'::cqc.job_type);


--
-- Name: TrainingCategories; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."TrainingCategories" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Category" text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."User" (
    "RegistrationID" integer NOT NULL,
    "FullNameValue" character varying(120),
    "JobTitleValue" character varying(255) NOT NULL,
    "EmailValue" character varying(255),
    "PhoneValue" character varying(50) NOT NULL,
    "EstablishmentID" integer,
    "UserRoleValue" cqc.user_role DEFAULT 'Edit'::cqc.user_role NOT NULL,
    "UserRoleSavedAt" timestamp without time zone,
    "UserRoleChangedAt" timestamp without time zone,
    "UserRoleSavedBy" character varying(120),
    "UserRoleChangedBy" character varying(120),
    "SecurityQuestionValue" character varying(255),
    "SecurityQuestionAnswerValue" character varying(255),
    "FullNameChangedAt" timestamp without time zone,
    "FullNameSavedBy" character varying(120),
    "FullNameChangedBy" character varying(120),
    "JobTitleSavedAt" timestamp without time zone,
    "JobTitleChangedAt" timestamp without time zone,
    "JobTitleSavedBy" character varying(120),
    "JobTitleChangedBy" character varying(120),
    "EmailSavedAt" timestamp without time zone,
    "EmailChangedAt" timestamp without time zone,
    "EmailSavedBy" character varying(120),
    "EmailChangedBy" character varying(120),
    "PhoneSavedAt" timestamp without time zone,
    "PhoneChangedAt" timestamp without time zone,
    "PhoneSavedBy" character varying(120),
    "PhoneChangedBy" character varying(120),
    "SecurityQuestionSavedAt" timestamp without time zone,
    "SecurityQuestionChangedAt" timestamp without time zone,
    "SecurityQuestionSavedBy" character varying(120),
    "SecurityQuestionChangedBy" character varying(120),
    "SecurityQuestionAnswerSavedAt" timestamp without time zone,
    "SecurityQuestionAnswerChangedAt" timestamp without time zone,
    "SecurityQuestionAnswerSavedBy" character varying(120),
    "SecurityQuestionAnswerChangedBy" character varying(120),
    "FullNameSavedAt" timestamp without time zone,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    updatedby character varying(120) NOT NULL,
    "Archived" boolean DEFAULT false,
    "UserUID" uuid NOT NULL,
    "IsPrimary" boolean DEFAULT true NOT NULL,
    "TribalID" integer,
    "TribalPasswordAnswer" character varying(255),
    "LaReportLockHeld" boolean DEFAULT false NOT NULL
);


--
-- Name: UserAudit; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."UserAudit" (
    "ID" integer NOT NULL,
    "UserFK" integer NOT NULL,
    "Username" character varying(120) NOT NULL,
    "When" timestamp without time zone DEFAULT now() NOT NULL,
    "EventType" cqc."UserAuditChangeType" NOT NULL,
    "PropertyName" character varying(100),
    "ChangeEvents" jsonb
);


--
-- Name: UserAudit_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."UserAudit_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserAudit_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."UserAudit_ID_seq" OWNED BY cqc."UserAudit"."ID";


--
-- Name: User_RegistrationID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."User_RegistrationID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_RegistrationID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."User_RegistrationID_seq" OWNED BY cqc."User"."RegistrationID";


--
-- Name: VacanciesVW; Type: VIEW; Schema: cqc; Owner: -
--

CREATE VIEW cqc."VacanciesVW" AS
 SELECT "EstablishmentJobs"."EstablishmentJobID",
    "EstablishmentJobs"."EstablishmentID",
    "EstablishmentJobs"."JobID",
    "EstablishmentJobs"."JobType",
    "EstablishmentJobs"."Total"
   FROM cqc."EstablishmentJobs"
  WHERE ("EstablishmentJobs"."JobType" = 'Vacancies'::cqc.job_type);


--
-- Name: Worker; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."Worker" (
    "ID" integer NOT NULL,
    "WorkerUID" uuid NOT NULL,
    "EstablishmentFK" integer NOT NULL,
    "NameOrIdValue" character varying(50) NOT NULL,
    "NameOrIdSavedAt" timestamp without time zone,
    "NameOrIdChangedAt" timestamp without time zone,
    "NameOrIdSavedBy" character varying(120),
    "NameOrIdChangedBy" character varying(120),
    "ContractValue" cqc."WorkerContract" NOT NULL,
    "ContractSavedAt" timestamp without time zone,
    "ContractChangedAt" timestamp without time zone,
    "ContractSavedBy" character varying(120),
    "ContractChangedBy" character varying(120),
    "MainJobFKValue" integer NOT NULL,
    "MainJobFKSavedAt" timestamp without time zone,
    "MainJobFKChangedAt" timestamp without time zone,
    "MainJobFKSavedBy" character varying(120),
    "MainJobFKChangedBy" character varying(120),
    "ApprovedMentalHealthWorkerValue" cqc."WorkerApprovedMentalHealthWorker",
    "ApprovedMentalHealthWorkerSavedAt" timestamp without time zone,
    "ApprovedMentalHealthWorkerChangedAt" timestamp without time zone,
    "ApprovedMentalHealthWorkerSavedBy" character varying(120),
    "ApprovedMentalHealthWorkerChangedBy" character varying(120),
    "MainJobStartDateValue" date,
    "MainJobStartDateSavedAt" timestamp without time zone,
    "MainJobStartDateChangedAt" timestamp without time zone,
    "MainJobStartDateSavedBy" character varying(120),
    "MainJobStartDateChangedBy" character varying(120),
    "OtherJobsValue" cqc."WorkerOtherJobs",
    "OtherJobsSavedAt" timestamp without time zone,
    "OtherJobsChangedAt" timestamp without time zone,
    "OtherJobsSavedBy" character varying(120),
    "OtherJobsChangedBy" character varying(120),
    "NationalInsuranceNumberValue" character varying(13),
    "NationalInsuranceNumberSavedAt" timestamp without time zone,
    "NationalInsuranceNumberChangedAt" timestamp without time zone,
    "NationalInsuranceNumberSavedBy" character varying(120),
    "NationalInsuranceNumberChangedBy" character varying(120),
    "DateOfBirthValue" date,
    "DateOfBirthSavedAt" timestamp without time zone,
    "DateOfBirthChangedAt" timestamp without time zone,
    "DateOfBirthSavedBy" character varying(120),
    "DateOfBirthChangedBy" character varying(120),
    "PostcodeValue" character varying(8),
    "PostcodeSavedAt" timestamp without time zone,
    "PostcodeChangedAt" timestamp without time zone,
    "PostcodeSavedBy" character varying(120),
    "PostcodeChangedBy" character varying(120),
    "DisabilityValue" cqc."WorkerDisability",
    "DisabilitySavedAt" timestamp without time zone,
    "DisabilityChangedAt" timestamp without time zone,
    "DisabilitySavedBy" character varying(120),
    "DisabilityChangedBy" character varying(120),
    "GenderValue" cqc."WorkerGender",
    "GenderSavedAt" timestamp without time zone,
    "GenderChangedAt" timestamp without time zone,
    "GenderSavedBy" character varying(120),
    "GenderChangedBy" character varying(120),
    "EthnicityFKValue" integer,
    "EthnicityFKSavedAt" timestamp without time zone,
    "EthnicityFKChangedAt" timestamp without time zone,
    "EthnicityFKSavedBy" character varying(120),
    "EthnicityFKChangedBy" character varying(120),
    "NationalityValue" cqc."WorkerNationality",
    "NationalityOtherFK" integer,
    "NationalitySavedAt" timestamp without time zone,
    "NationalityChangedAt" timestamp without time zone,
    "NationalitySavedBy" character varying(120),
    "NationalityChangedBy" character varying(120),
    "CountryOfBirthValue" cqc."WorkerCountryOfBirth",
    "CountryOfBirthOtherFK" integer,
    "CountryOfBirthSavedAt" timestamp without time zone,
    "CountryOfBirthChangedAt" timestamp without time zone,
    "CountryOfBirthSavedBy" character varying(120),
    "CountryOfBirthChangedBy" character varying(120),
    "RecruitedFromValue" cqc."WorkerRecruitedFrom",
    "RecruitedFromOtherFK" integer,
    "RecruitedFromSavedAt" timestamp without time zone,
    "RecruitedFromChangedAt" timestamp without time zone,
    "RecruitedFromSavedBy" character varying(120),
    "RecruitedFromChangedBy" character varying(120),
    "BritishCitizenshipValue" cqc."WorkerBritishCitizenship",
    "BritishCitizenshipSavedAt" timestamp without time zone,
    "BritishCitizenshipChangedAt" timestamp without time zone,
    "BritishCitizenshipSavedBy" character varying(120),
    "BritishCitizenshipChangedBy" character varying(120),
    "YearArrivedValue" cqc."WorkerYearArrived",
    "YearArrivedYear" integer,
    "YearArrivedSavedAt" timestamp without time zone,
    "YearArrivedChangedAt" timestamp without time zone,
    "YearArrivedSavedBy" character varying(120),
    "YearArrivedChangedBy" character varying(120),
    "SocialCareStartDateValue" cqc."WorkerSocialCareStartDate",
    "SocialCareStartDateYear" integer,
    "SocialCareStartDateSavedAt" timestamp without time zone,
    "SocialCareStartDateChangedAt" timestamp without time zone,
    "SocialCareStartDateSavedBy" character varying(120),
    "SocialCareStartDateChangedBy" character varying(120),
    "DaysSickValue" cqc."WorkerDaysSick",
    "DaysSickDays" numeric(4,1),
    "DaysSickSavedAt" timestamp without time zone,
    "DaysSickChangedAt" timestamp without time zone,
    "DaysSickSavedBy" character varying(120),
    "DaysSickChangedBy" character varying(120),
    "ZeroHoursContractValue" cqc."WorkerZeroHoursContract",
    "ZeroHoursContractSavedAt" timestamp without time zone,
    "ZeroHoursContractChangedAt" timestamp without time zone,
    "ZeroHoursContractSavedBy" character varying(120),
    "ZeroHoursContractChangedBy" character varying(120),
    "WeeklyHoursAverageValue" cqc."WorkerWeeklyHoursAverage",
    "WeeklyHoursAverageHours" numeric(4,1),
    "WeeklyHoursAverageSavedAt" timestamp without time zone,
    "WeeklyHoursAverageChangedAt" timestamp without time zone,
    "WeeklyHoursAverageSavedBy" character varying(120),
    "WeeklyHoursAverageChangedBy" character varying(120),
    "WeeklyHoursContractedValue" cqc."WorkerWeeklyHoursContracted",
    "WeeklyHoursContractedHours" numeric(4,1),
    "WeeklyHoursContractedSavedAt" timestamp without time zone,
    "WeeklyHoursContractedChangedAt" timestamp without time zone,
    "WeeklyHoursContractedSavedBy" character varying(120),
    "WeeklyHoursContractedChangedBy" character varying(120),
    "AnnualHourlyPayValue" cqc."WorkerAnnualHourlyPay",
    "AnnualHourlyPayRate" numeric(9,2),
    "AnnualHourlyPaySavedAt" timestamp without time zone,
    "AnnualHourlyPayChangedAt" timestamp without time zone,
    "AnnualHourlyPaySavedBy" character varying(120),
    "AnnualHourlyPayChangedBy" character varying(120),
    "CareCertificateValue" cqc."WorkerCareCertificate",
    "CareCertificateSavedAt" timestamp without time zone,
    "CareCertificateChangedAt" timestamp without time zone,
    "CareCertificateSavedBy" character varying(120),
    "CareCertificateChangedBy" character varying(120),
    "ApprenticeshipTrainingValue" cqc."WorkerApprenticeshipTraining",
    "ApprenticeshipTrainingSavedAt" timestamp without time zone,
    "ApprenticeshipTrainingChangedAt" timestamp without time zone,
    "ApprenticeshipTrainingSavedBy" character varying(120),
    "ApprenticeshipTrainingChangedBy" character varying(120),
    "QualificationInSocialCareValue" cqc."WorkerQualificationInSocialCare",
    "QualificationInSocialCareSavedAt" timestamp without time zone,
    "QualificationInSocialCareChangedAt" timestamp without time zone,
    "QualificationInSocialCareSavedBy" character varying(120),
    "QualificationInSocialCareChangedBy" character varying(120),
    "SocialCareQualificationFKValue" integer,
    "SocialCareQualificationFKSavedAt" timestamp without time zone,
    "SocialCareQualificationFKChangedAt" timestamp without time zone,
    "SocialCareQualificationFKSavedBy" character varying(120),
    "SocialCareQualificationFKChangedBy" character varying(120),
    "OtherQualificationsValue" cqc."WorkerOtherQualifications",
    "OtherQualificationsSavedAt" timestamp without time zone,
    "OtherQualificationsChangedAt" timestamp without time zone,
    "OtherQualificationsSavedBy" character varying(120),
    "OtherQualificationsChangedBy" character varying(120),
    "HighestQualificationFKValue" integer,
    "HighestQualificationFKSavedAt" timestamp without time zone,
    "HighestQualificationFKChangedAt" timestamp without time zone,
    "HighestQualificationFKSavedBy" character varying(120),
    "HighestQualificationFKChangedBy" character varying(120),
    "CompletedValue" boolean DEFAULT false,
    "CompletedSavedAt" timestamp without time zone,
    "CompletedChangedAt" timestamp without time zone,
    "CompletedSavedBy" character varying(120),
    "CompletedChangedBy" character varying(120),
    "Archived" boolean DEFAULT false NOT NULL,
    "LeaveReasonFK" integer,
    "LeaveReasonOther" text,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    updatedby character varying(120) NOT NULL,
    "LastWdfEligibility" timestamp without time zone,
    "TribalID" integer,
    "MainJobFkOther" text,
    "DataSource" cqc."DataSource" DEFAULT 'Online'::cqc."DataSource",
    "RegisteredNurseSavedAt" timestamp without time zone,
    "RegisteredNurseChangedAt" timestamp without time zone,
    "RegisteredNurseSavedBy" character varying(120),
    "RegisteredNurseChangedBy" character varying(120),
    "NurseSpecialismFKValue" integer,
    "NurseSpecialismFKOther" text,
    "NurseSpecialismFKSavedAt" timestamp without time zone,
    "NurseSpecialismFKChangedAt" timestamp without time zone,
    "NurseSpecialismFKSavedBy" character varying(120),
    "NurseSpecialismFKChangedBy" character varying(120),
    "RegisteredNurseValue" cqc.worker_registerednurses_enum,
    "LocalIdentifierValue" text,
    "LocalIdentifierSavedAt" timestamp without time zone,
    "LocalIdentifierSavedBy" text,
    "LocalIdentifierChangedAt" timestamp without time zone,
    "LocalIdentifierChangedBy" text,
    "EstablishmentFkSavedAt" timestamp with time zone,
    "EstablishmentFkChangedAt" timestamp with time zone,
    "EstablishmentFkSavedBy" character varying(120),
    "EstablishmentFkChangedBy" character varying(120)
);


--
-- Name: WorkerAudit; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."WorkerAudit" (
    "ID" integer NOT NULL,
    "WorkerFK" integer NOT NULL,
    "Username" character varying(120) NOT NULL,
    "When" timestamp without time zone DEFAULT now() NOT NULL,
    "EventType" cqc."WorkerAuditChangeType" NOT NULL,
    "PropertyName" character varying(100),
    "ChangeEvents" jsonb
);


--
-- Name: WorkerAudit_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."WorkerAudit_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkerAudit_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."WorkerAudit_ID_seq" OWNED BY cqc."WorkerAudit"."ID";


--
-- Name: WorkerJobs; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."WorkerJobs" (
    "ID" integer NOT NULL,
    "WorkerFK" integer NOT NULL,
    "JobFK" integer NOT NULL,
    "Other" text
);


--
-- Name: WorkerJobs_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."WorkerJobs_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkerJobs_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."WorkerJobs_ID_seq" OWNED BY cqc."WorkerJobs"."ID";


--
-- Name: WorkerLeaveReasons; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."WorkerLeaveReasons" (
    "ID" integer NOT NULL,
    "Seq" integer NOT NULL,
    "Reason" text NOT NULL
);


--
-- Name: WorkerQualifications; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."WorkerQualifications" (
    "ID" integer NOT NULL,
    "UID" uuid NOT NULL,
    "WorkerFK" integer NOT NULL,
    "QualificationsFK" integer NOT NULL,
    "Year" smallint,
    "Notes" text,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    updatedby character varying(120) NOT NULL,
    "TribalID" integer,
    "DataSource" cqc."DataSource" DEFAULT 'Online'::cqc."DataSource"
);


--
-- Name: WorkerQualifications_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."WorkerQualifications_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkerQualifications_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."WorkerQualifications_ID_seq" OWNED BY cqc."WorkerQualifications"."ID";


--
-- Name: WorkerTraining; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc."WorkerTraining" (
    "ID" integer NOT NULL,
    "UID" uuid NOT NULL,
    "WorkerFK" integer NOT NULL,
    "CategoryFK" integer NOT NULL,
    "Title" character varying(120),
    "Accredited" cqc."WorkerTrainingAccreditation",
    "Completed" date,
    "Expires" date,
    "Notes" text,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now() NOT NULL,
    updatedby character varying(120) NOT NULL,
    "TribalID" integer,
    "DataSource" cqc."DataSource" DEFAULT 'Online'::cqc."DataSource"
);


--
-- Name: WorkerTraining_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."WorkerTraining_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkerTraining_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."WorkerTraining_ID_seq" OWNED BY cqc."WorkerTraining"."ID";


--
-- Name: Worker_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc."Worker_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Worker_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc."Worker_ID_seq" OWNED BY cqc."Worker"."ID";


--
-- Name: cqclog_id_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc.cqclog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cqclog_id_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc.cqclog_id_seq OWNED BY cqc."CqcLog".id;


--
-- Name: location_cqcid_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc.location_cqcid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: log_id_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc.log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc.services (
    id integer NOT NULL,
    name text,
    category text,
    iscqcregistered boolean,
    ismain boolean DEFAULT true,
    "reportingID" integer,
    other boolean DEFAULT false
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: cqc; Owner: -
--

CREATE SEQUENCE cqc.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: -
--

ALTER SEQUENCE cqc.services_id_seq OWNED BY cqc.services.id;


--
-- Name: workerora; Type: TABLE; Schema: cqc; Owner: -
--

CREATE TABLE cqc.workerora (
    "ID" integer,
    "NationalInsuranceNumberValue" character varying(13),
    "DateOfBirthValue" date
);


--
-- Name: location; Type: TABLE; Schema: cqcref; Owner: -
--

CREATE TABLE cqcref.location (
    locationid text NOT NULL,
    locationname text,
    addressline1 text,
    addressline2 text,
    towncity text,
    county text,
    postalcode text,
    mainservice text,
    createdat timestamp without time zone NOT NULL,
    updatedat timestamp without time zone
);


--
-- Name: pcode; Type: TABLE; Schema: cqcref; Owner: -
--

CREATE TABLE cqcref.pcode (
    postcode character varying,
    local_custodian_code bigint,
    postcode_part text,
    region text,
    cssr text
);


--
-- Name: pcodedata; Type: TABLE; Schema: cqcref; Owner: -
--

CREATE TABLE cqcref.pcodedata (
    uprn bigint,
    sub_building_name character varying,
    building_name character varying,
    building_number character varying,
    street_description character varying,
    post_town character varying,
    postcode character varying,
    local_custodian_code bigint,
    county character varying,
    rm_organisation_name character varying
);


--
-- Name: CqcLog id; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."CqcLog" ALTER COLUMN id SET DEFAULT nextval('cqc.cqclog_id_seq'::regclass);


--
-- Name: Establishment EstablishmentID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Establishment" ALTER COLUMN "EstablishmentID" SET DEFAULT nextval('cqc."Establishment_EstablishmentID_seq"'::regclass);


--
-- Name: EstablishmentAudit ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentAudit" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."EstablishmentAudit_ID_seq"'::regclass);


--
-- Name: EstablishmentCapacity EstablishmentCapacityID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentCapacity" ALTER COLUMN "EstablishmentCapacityID" SET DEFAULT nextval('cqc."EstablishmentCapacity_EstablishmentCapacityID_seq"'::regclass);


--
-- Name: EstablishmentJobs EstablishmentJobID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentJobs" ALTER COLUMN "EstablishmentJobID" SET DEFAULT nextval('cqc."EstablishmentJobs_EstablishmentJobID_seq"'::regclass);


--
-- Name: EstablishmentLocalAuthority EstablishmentLocalAuthorityID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentLocalAuthority" ALTER COLUMN "EstablishmentLocalAuthorityID" SET DEFAULT nextval('cqc."EstablishmentLocalAuthority_EstablishmentLocalAuthorityID_seq"'::regclass);


--
-- Name: LocalAuthorityReportEstablishment ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportEstablishment" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."LocalAuthorityReportEstablishment_ID_seq"'::regclass);


--
-- Name: LocalAuthorityReportWorker ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportWorker" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."LocalAuthorityReportWorker_ID_seq"'::regclass);


--
-- Name: Login ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Login" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."Login_ID_seq"'::regclass);


--
-- Name: MandatoryTraining ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."MandatoryTraining_ID_seq"'::regclass);


--
-- Name: User RegistrationID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."User" ALTER COLUMN "RegistrationID" SET DEFAULT nextval('cqc."User_RegistrationID_seq"'::regclass);


--
-- Name: UserAudit ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."UserAudit" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."UserAudit_ID_seq"'::regclass);


--
-- Name: Worker ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."Worker_ID_seq"'::regclass);


--
-- Name: WorkerAudit ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerAudit" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."WorkerAudit_ID_seq"'::regclass);


--
-- Name: WorkerJobs ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerJobs" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."WorkerJobs_ID_seq"'::regclass);


--
-- Name: WorkerQualifications ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerQualifications" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."WorkerQualifications_ID_seq"'::regclass);


--
-- Name: WorkerTraining ID; Type: DEFAULT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerTraining" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."WorkerTraining_ID_seq"'::regclass);


--
-- Name: AddUserTracking AddUserTracking_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."AddUserTracking"
    ADD CONSTRAINT "AddUserTracking_pkey" PRIMARY KEY ("ID");


--
-- Name: Approvals Approvals_UUID_key; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Approvals"
    ADD CONSTRAINT "Approvals_UUID_key" UNIQUE ("UUID");


--
-- Name: Approvals Approvals_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Approvals"
    ADD CONSTRAINT "Approvals_pkey" PRIMARY KEY ("ID");


--
-- Name: CqcLog CQCLog_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."CqcLog"
    ADD CONSTRAINT "CQCLog_pkey" PRIMARY KEY (id);


--
-- Name: Country Country_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Country"
    ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("ID");


--
-- Name: Cssr Cssr_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Cssr"
    ADD CONSTRAINT "Cssr_pkey" PRIMARY KEY ("CssrID", "LocalCustodianCode");


--
-- Name: EstablishmentAudit EstablishmentAudit_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentAudit"
    ADD CONSTRAINT "EstablishmentAudit_pkey" PRIMARY KEY ("ID");


--
-- Name: EstablishmentCapacity EstablishmentCapacity_pkey1; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentCapacity"
    ADD CONSTRAINT "EstablishmentCapacity_pkey1" PRIMARY KEY ("EstablishmentCapacityID");


--
-- Name: LocalAuthorityReportWorker EstablishmentFK_WorkerFK; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportWorker"
    ADD CONSTRAINT "EstablishmentFK_WorkerFK" UNIQUE ("EstablishmentFK", "WorkerFK");


--
-- Name: LocalAuthorityReportEstablishment EstablishmentFK_WorkplaceID; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportEstablishment"
    ADD CONSTRAINT "EstablishmentFK_WorkplaceID" UNIQUE ("EstablishmentFK", "WorkplaceID");


--
-- Name: EstablishmentJobs EstablishmentJobs_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentJobs"
    ADD CONSTRAINT "EstablishmentJobs_pkey" PRIMARY KEY ("EstablishmentJobID");


--
-- Name: EstablishmentCapacity EstablishmentServiceCapacity_unq1; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentCapacity"
    ADD CONSTRAINT "EstablishmentServiceCapacity_unq1" UNIQUE ("EstablishmentID", "ServiceCapacityID");


--
-- Name: Establishment Establishment_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Establishment"
    ADD CONSTRAINT "Establishment_pkey" PRIMARY KEY ("EstablishmentID");


--
-- Name: Ethnicity Ethnicity_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Ethnicity"
    ADD CONSTRAINT "Ethnicity_pkey" PRIMARY KEY ("ID");


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY ("JobID");


--
-- Name: LinkToParent LinkToParent_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LinkToParent"
    ADD CONSTRAINT "LinkToParent_pkey" PRIMARY KEY ("LinkToParentUID");


--
-- Name: LocalAuthorityReportEstablishment LocalAuthorityReportEstablishment_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportEstablishment"
    ADD CONSTRAINT "LocalAuthorityReportEstablishment_pkey" PRIMARY KEY ("ID");


--
-- Name: LocalAuthorityReportWorker LocalAuthorityReportWorker_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LocalAuthorityReportWorker"
    ADD CONSTRAINT "LocalAuthorityReportWorker_pkey" PRIMARY KEY ("ID");


--
-- Name: MandatoryTraining MandatoryTraining_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT "MandatoryTraining_pkey" PRIMARY KEY ("ID");


--
-- Name: Nationality Nationality_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Nationality"
    ADD CONSTRAINT "Nationality_pkey" PRIMARY KEY ("ID");


--
-- Name: NurseSpecialism NurseSpecialism_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."NurseSpecialism"
    ADD CONSTRAINT "NurseSpecialism_pkey" PRIMARY KEY ("ID");


--
-- Name: EstablishmentServices OtherServices_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentServices"
    ADD CONSTRAINT "OtherServices_pkey" PRIMARY KEY ("EstablishmentID", "ServiceID");


--
-- Name: OwnerChangeRequest OwnerChangeRequest_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."OwnerChangeRequest"
    ADD CONSTRAINT "OwnerChangeRequest_pkey" PRIMARY KEY ("ownerChangeRequestUID");


--
-- Name: PasswdResetTracking PasswdResetTracking_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."PasswdResetTracking"
    ADD CONSTRAINT "PasswdResetTracking_pkey" PRIMARY KEY ("ID");


--
-- Name: Qualification Qualification_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Qualification"
    ADD CONSTRAINT "Qualification_pkey" PRIMARY KEY ("ID");


--
-- Name: Qualifications Qualifications_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Qualifications"
    ADD CONSTRAINT "Qualifications_pkey" PRIMARY KEY ("ID");


--
-- Name: RecruitedFrom RecruitedFrom_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."RecruitedFrom"
    ADD CONSTRAINT "RecruitedFrom_pkey" PRIMARY KEY ("ID");


--
-- Name: ServiceUsers ServiceUsers_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."ServiceUsers"
    ADD CONSTRAINT "ServiceUsers_pkey" PRIMARY KEY ("ID");


--
-- Name: ServicesCapacity ServicesCapacity_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."ServicesCapacity"
    ADD CONSTRAINT "ServicesCapacity_pkey" PRIMARY KEY ("ServiceCapacityID");


--
-- Name: TrainingCategories TrainingCategories_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."TrainingCategories"
    ADD CONSTRAINT "TrainingCategories_pkey" PRIMARY KEY ("ID");


--
-- Name: UserAudit UserAudit_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."UserAudit"
    ADD CONSTRAINT "UserAudit_pkey" PRIMARY KEY ("ID");


--
-- Name: WorkerAudit WorkerAudit_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerAudit"
    ADD CONSTRAINT "WorkerAudit_pkey" PRIMARY KEY ("ID");


--
-- Name: WorkerJobs WorkerJobs_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerJobs"
    ADD CONSTRAINT "WorkerJobs_pkey" PRIMARY KEY ("ID");


--
-- Name: WorkerLeaveReasons WorkerLeaveReasons_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerLeaveReasons"
    ADD CONSTRAINT "WorkerLeaveReasons_pkey" PRIMARY KEY ("ID");


--
-- Name: WorkerQualifications WorkerQualifications_UID_unq; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerQualifications"
    ADD CONSTRAINT "WorkerQualifications_UID_unq" UNIQUE ("UID");


--
-- Name: WorkerQualifications WorkerQualifications_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerQualifications"
    ADD CONSTRAINT "WorkerQualifications_pkey" PRIMARY KEY ("ID");


--
-- Name: WorkerTraining WorkerTraining_UID_unq; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerTraining"
    ADD CONSTRAINT "WorkerTraining_UID_unq" UNIQUE ("UID");


--
-- Name: WorkerTraining WorkerTraining_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerTraining"
    ADD CONSTRAINT "WorkerTraining_pkey" PRIMARY KEY ("ID");


--
-- Name: Worker Worker_WorkerUID_unq; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_WorkerUID_unq" UNIQUE ("WorkerUID");


--
-- Name: Worker Worker_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_pkey" PRIMARY KEY ("ID");


--
-- Name: EstablishmentLocalAuthority establishmentlocalauthority_pk; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentLocalAuthority"
    ADD CONSTRAINT establishmentlocalauthority_pk PRIMARY KEY ("EstablishmentLocalAuthorityID");


--
-- Name: Feedback feedback_pk; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Feedback"
    ADD CONSTRAINT feedback_pk PRIMARY KEY ("FeedbackID");


--
-- Name: Login pk_Login; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Login"
    ADD CONSTRAINT "pk_Login" PRIMARY KEY ("ID");


--
-- Name: Notifications pk_Notifications; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Notifications"
    ADD CONSTRAINT "pk_Notifications" PRIMARY KEY ("notificationUid");


--
-- Name: User pk_User; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."User"
    ADD CONSTRAINT "pk_User" PRIMARY KEY ("RegistrationID");


--
-- Name: services reportingID_Unq; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc.services
    ADD CONSTRAINT "reportingID_Unq" UNIQUE ("reportingID");


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: Login uc_Login_Username; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Login"
    ADD CONSTRAINT "uc_Login_Username" UNIQUE ("Username");


--
-- Name: services unq_serviceid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc.services
    ADD CONSTRAINT unq_serviceid UNIQUE (id);


--
-- Name: ServicesCapacity unq_servicescapacityid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."ServicesCapacity"
    ADD CONSTRAINT unq_servicescapacityid UNIQUE ("ServiceCapacityID");


--
-- Name: User unq_userregistrationid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."User"
    ADD CONSTRAINT unq_userregistrationid UNIQUE ("RegistrationID");


--
-- Name: User unq_useruid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."User"
    ADD CONSTRAINT unq_useruid UNIQUE ("UserUID");


--
-- Name: Establishment unqestbid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Establishment"
    ADD CONSTRAINT unqestbid UNIQUE ("EstablishmentID");


--
-- Name: ServicesCapacity unqsrvcid; Type: CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."ServicesCapacity"
    ADD CONSTRAINT unqsrvcid UNIQUE ("ServiceID", "Sequence");


--
-- Name: location locationid_pk; Type: CONSTRAINT; Schema: cqcref; Owner: -
--

ALTER TABLE ONLY cqcref.location
    ADD CONSTRAINT locationid_pk PRIMARY KEY (locationid);


--
-- Name: location locationid_unq; Type: CONSTRAINT; Schema: cqcref; Owner: -
--

ALTER TABLE ONLY cqcref.location
    ADD CONSTRAINT locationid_unq UNIQUE (locationid);


--
-- Name: location uniqlocationid; Type: CONSTRAINT; Schema: cqcref; Owner: -
--

ALTER TABLE ONLY cqcref.location
    ADD CONSTRAINT uniqlocationid UNIQUE (locationid);


--
-- Name: EstablishmentAuditIdx01; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "EstablishmentAuditIdx01" ON cqc."EstablishmentAudit" USING btree ("EstablishmentFK", "EventType", "When");


--
-- Name: EstablishmentServiceUsersIdx; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "EstablishmentServiceUsersIdx" ON cqc."EstablishmentServiceUsers" USING btree ("EstablishmentID", "ServiceUserID");


--
-- Name: EstablshmentAudit_EstablishmentFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "EstablshmentAudit_EstablishmentFK" ON cqc."EstablishmentAudit" USING btree ("EstablishmentFK");


--
-- Name: UserAudit_UserFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "UserAudit_UserFK" ON cqc."UserAudit" USING btree ("UserFK");


--
-- Name: WorkerAuditIdx01; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerAuditIdx01" ON cqc."WorkerAudit" USING btree ("WorkerFK", "EventType", "When");


--
-- Name: WorkerAudit_WorkerFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerAudit_WorkerFK" ON cqc."WorkerAudit" USING btree ("WorkerFK");


--
-- Name: WorkerJobs_JobFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerJobs_JobFK" ON cqc."WorkerJobs" USING btree ("JobFK");


--
-- Name: WorkerJobs_WorkerFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerJobs_WorkerFK" ON cqc."WorkerJobs" USING btree ("WorkerFK");


--
-- Name: WorkerQualifications_QualificationsFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerQualifications_QualificationsFK" ON cqc."WorkerQualifications" USING btree ("QualificationsFK");


--
-- Name: WorkerQualifications_WorkerFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerQualifications_WorkerFK" ON cqc."WorkerQualifications" USING btree ("WorkerFK");


--
-- Name: WorkerTraining_QualificationsFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerTraining_QualificationsFK" ON cqc."WorkerTraining" USING btree ("CategoryFK");


--
-- Name: WorkerTraining_WorkerFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "WorkerTraining_WorkerFK" ON cqc."WorkerTraining" USING btree ("WorkerFK");


--
-- Name: Worker_EstablishmentFK; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX "Worker_EstablishmentFK" ON cqc."Worker" USING btree ("EstablishmentFK");


--
-- Name: Worker_WorkerUID; Type: INDEX; Schema: cqc; Owner: -
--

CREATE UNIQUE INDEX "Worker_WorkerUID" ON cqc."Worker" USING btree ("WorkerUID");


--
-- Name: localauthorityreportestablishment_establishmentfk; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX localauthorityreportestablishment_establishmentfk ON cqc."LocalAuthorityReportEstablishment" USING btree ("EstablishmentFK");


--
-- Name: localauthorityreportworker_establishmentfk; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX localauthorityreportworker_establishmentfk ON cqc."LocalAuthorityReportWorker" USING btree ("EstablishmentFK");


--
-- Name: localauthorityreportworker_workerfk; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX localauthorityreportworker_workerfk ON cqc."LocalAuthorityReportWorker" USING btree ("WorkerFK");


--
-- Name: notifications_user_fki; Type: INDEX; Schema: cqc; Owner: -
--

CREATE INDEX notifications_user_fki ON cqc."Notifications" USING btree ("recipientUserUid");


--
-- Name: Postcodedata_postcode_Idx; Type: INDEX; Schema: cqcref; Owner: -
--

CREATE INDEX "Postcodedata_postcode_Idx" ON cqcref.pcodedata USING btree (postcode text_pattern_ops);


--
-- Name: pcode_postcode; Type: INDEX; Schema: cqcref; Owner: -
--

CREATE INDEX pcode_postcode ON cqcref.pcode USING btree (postcode);


--
-- Name: pcode_postcode_PART; Type: INDEX; Schema: cqcref; Owner: -
--

CREATE INDEX "pcode_postcode_PART" ON cqcref.pcode USING btree (postcode_part);


--
-- Name: EstablishmentMainServicesWithCapacitiesVW _RETURN; Type: RULE; Schema: cqc; Owner: -
--

CREATE OR REPLACE VIEW cqc."EstablishmentMainServicesWithCapacitiesVW" AS
 SELECT "EstablishmentMainServicesWithCapacitiesTwo"."EstablishmentID",
        CASE
            WHEN ("EstablishmentMainServicesWithCapacitiesTwo"."CAPACITY" IS NULL) THEN ('-1'::integer)::bigint
            ELSE "EstablishmentMainServicesWithCapacitiesTwo"."CAPACITY"
        END AS "CAPACITY",
        CASE
            WHEN ("EstablishmentMainServicesWithCapacitiesTwo"."UTILISATION" IS NULL) THEN ('-1'::integer)::bigint
            ELSE "EstablishmentMainServicesWithCapacitiesTwo"."UTILISATION"
        END AS "UTILISATION"
   FROM ( SELECT "EstablishmentMainServicesWithCapacities"."EstablishmentID",
            sum("EstablishmentMainServicesWithCapacities"."Answer") FILTER (WHERE ("EstablishmentMainServicesWithCapacities"."Type" = 'Capacity'::cqc."ServicesCapacityType")) AS "CAPACITY",
            sum("EstablishmentMainServicesWithCapacities"."Answer") FILTER (WHERE ("EstablishmentMainServicesWithCapacities"."Type" = 'Utilisation'::cqc."ServicesCapacityType")) AS "UTILISATION"
           FROM ( SELECT "AllEstablishmentCapacityQuestions"."EstablishmentID",
                    "AllEstablishmentCapacityQuestions"."ServiceCapacityID",
                    "AllEstablishmentCapacityQuestions"."Sequence",
                    "AllEstablishmentCapacityQuestions"."Type",
                    "AllEstablishmentCapacityQuestions"."Question",
                    "AllEstablishmentCapacities"."Answer"
                   FROM (( SELECT "Establishment"."EstablishmentID",
                            "ServicesCapacity"."ServiceCapacityID",
                            "ServicesCapacity"."Sequence",
                            "ServicesCapacity"."Type",
                            "ServicesCapacity"."Question"
                           FROM cqc."ServicesCapacity",
                            ((cqc."Establishment"
                             JOIN cqc.services ON (("Establishment"."MainServiceFKValue" = services.id)))
                             LEFT JOIN cqc."EstablishmentCapacity" ON (("Establishment"."EstablishmentID" = "EstablishmentCapacity"."EstablishmentID")))
                          WHERE (("ServicesCapacity"."ServiceID" = services.id) AND (services.id IN ( SELECT DISTINCT "ServicesCapacity_1"."ServiceID"
                                   FROM cqc."ServicesCapacity" "ServicesCapacity_1"
                                  GROUP BY "ServicesCapacity_1"."ServiceID"
                                 HAVING (count(0) > 1))))
                          GROUP BY "Establishment"."EstablishmentID", "ServicesCapacity"."ServiceCapacityID", "ServicesCapacity"."Type", "ServicesCapacity"."Sequence"
                          ORDER BY "Establishment"."EstablishmentID", "ServicesCapacity"."Sequence") "AllEstablishmentCapacityQuestions"
                     LEFT JOIN ( SELECT "EstablishmentCapacity"."EstablishmentID",
                            "EstablishmentCapacity"."ServiceCapacityID",
                            "EstablishmentCapacity"."Answer"
                           FROM (cqc."EstablishmentCapacity"
                             JOIN cqc."ServicesCapacity" ON (("ServicesCapacity"."ServiceCapacityID" = "EstablishmentCapacity"."ServiceCapacityID")))) "AllEstablishmentCapacities" ON ((("AllEstablishmentCapacities"."ServiceCapacityID" = "AllEstablishmentCapacityQuestions"."ServiceCapacityID") AND ("AllEstablishmentCapacities"."EstablishmentID" = "AllEstablishmentCapacityQuestions"."EstablishmentID"))))
                  ORDER BY "AllEstablishmentCapacityQuestions"."EstablishmentID", "AllEstablishmentCapacityQuestions"."Sequence") "EstablishmentMainServicesWithCapacities"
          GROUP BY "EstablishmentMainServicesWithCapacities"."EstablishmentID") "EstablishmentMainServicesWithCapacitiesTwo"
UNION
 SELECT "EstablishmentMainServicesWithCapacitiesTwo"."EstablishmentID",
        CASE
            WHEN ("EstablishmentMainServicesWithCapacitiesTwo"."CAPACITY" IS NULL) THEN ('-1'::integer)::bigint
            ELSE "EstablishmentMainServicesWithCapacitiesTwo"."CAPACITY"
        END AS "CAPACITY",
    NULL::bigint AS "UTILISATION"
   FROM ( SELECT "EstablishmentMainServicesWithCapacities"."EstablishmentID",
            sum("EstablishmentMainServicesWithCapacities"."Answer") FILTER (WHERE ("EstablishmentMainServicesWithCapacities"."Type" = 'Capacity'::cqc."ServicesCapacityType")) AS "CAPACITY"
           FROM ( SELECT "AllEstablishmentCapacityQuestions"."EstablishmentID",
                    "AllEstablishmentCapacityQuestions"."ServiceCapacityID",
                    "AllEstablishmentCapacityQuestions"."Sequence",
                    "AllEstablishmentCapacityQuestions"."Type",
                    "AllEstablishmentCapacityQuestions"."Question",
                    "AllEstablishmentCapacities"."Answer"
                   FROM (( SELECT "Establishment"."EstablishmentID",
                            "ServicesCapacity"."ServiceCapacityID",
                            services.id,
                            services.name,
                            "ServicesCapacity"."Sequence",
                            "ServicesCapacity"."Type",
                            "ServicesCapacity"."Question"
                           FROM cqc."ServicesCapacity",
                            ((cqc."Establishment"
                             JOIN cqc.services ON (("Establishment"."MainServiceFKValue" = services.id)))
                             LEFT JOIN cqc."EstablishmentCapacity" ON (("Establishment"."EstablishmentID" = "EstablishmentCapacity"."EstablishmentID")))
                          WHERE (("ServicesCapacity"."ServiceID" = services.id) AND (services.id IN ( SELECT DISTINCT "ServicesCapacity_1"."ServiceID"
                                   FROM cqc."ServicesCapacity" "ServicesCapacity_1"
                                  GROUP BY "ServicesCapacity_1"."ServiceID"
                                 HAVING (count(0) = 1))) AND ("ServicesCapacity"."Type" = 'Capacity'::cqc."ServicesCapacityType"))
                          GROUP BY "Establishment"."EstablishmentID", "ServicesCapacity"."ServiceCapacityID", services.id, services.name, "ServicesCapacity"."Sequence"
                          ORDER BY "Establishment"."EstablishmentID", "ServicesCapacity"."Sequence") "AllEstablishmentCapacityQuestions"
                     LEFT JOIN ( SELECT "EstablishmentCapacity"."EstablishmentID",
                            "EstablishmentCapacity"."ServiceCapacityID",
                            "EstablishmentCapacity"."Answer"
                           FROM (cqc."EstablishmentCapacity"
                             JOIN cqc."ServicesCapacity" ON (("ServicesCapacity"."ServiceCapacityID" = "EstablishmentCapacity"."ServiceCapacityID")))) "AllEstablishmentCapacities" ON ((("AllEstablishmentCapacities"."ServiceCapacityID" = "AllEstablishmentCapacityQuestions"."ServiceCapacityID") AND ("AllEstablishmentCapacities"."EstablishmentID" = "AllEstablishmentCapacityQuestions"."EstablishmentID"))))
                  ORDER BY "AllEstablishmentCapacityQuestions"."EstablishmentID", "AllEstablishmentCapacityQuestions"."Sequence") "EstablishmentMainServicesWithCapacities"
          GROUP BY "EstablishmentMainServicesWithCapacities"."EstablishmentID") "EstablishmentMainServicesWithCapacitiesTwo"
UNION
 SELECT "EstablishmentMainServicesWithCapacitiesTwo"."EstablishmentID",
    NULL::bigint AS "CAPACITY",
        CASE
            WHEN ("EstablishmentMainServicesWithCapacitiesTwo"."UTILISATION" IS NULL) THEN ('-1'::integer)::bigint
            ELSE "EstablishmentMainServicesWithCapacitiesTwo"."UTILISATION"
        END AS "UTILISATION"
   FROM ( SELECT "EstablishmentMainServicesWithCapacities"."EstablishmentID",
            sum("EstablishmentMainServicesWithCapacities"."Answer") FILTER (WHERE ("EstablishmentMainServicesWithCapacities"."Type" = 'Utilisation'::cqc."ServicesCapacityType")) AS "UTILISATION"
           FROM ( SELECT "AllEstablishmentCapacityQuestions"."EstablishmentID",
                    "AllEstablishmentCapacityQuestions"."ServiceCapacityID",
                    "AllEstablishmentCapacityQuestions"."Sequence",
                    "AllEstablishmentCapacityQuestions"."Type",
                    "AllEstablishmentCapacityQuestions"."Question",
                    "AllEstablishmentCapacities"."Answer"
                   FROM (( SELECT "Establishment"."EstablishmentID",
                            "ServicesCapacity"."ServiceCapacityID",
                            services.id,
                            services.name,
                            "ServicesCapacity"."Sequence",
                            "ServicesCapacity"."Type",
                            "ServicesCapacity"."Question"
                           FROM cqc."ServicesCapacity",
                            ((cqc."Establishment"
                             JOIN cqc.services ON (("Establishment"."MainServiceFKValue" = services.id)))
                             LEFT JOIN cqc."EstablishmentCapacity" ON (("Establishment"."EstablishmentID" = "EstablishmentCapacity"."EstablishmentID")))
                          WHERE (("ServicesCapacity"."ServiceID" = services.id) AND (services.id IN ( SELECT DISTINCT "ServicesCapacity_1"."ServiceID"
                                   FROM cqc."ServicesCapacity" "ServicesCapacity_1"
                                  GROUP BY "ServicesCapacity_1"."ServiceID"
                                 HAVING (count(0) = 1))) AND ("ServicesCapacity"."Type" = 'Utilisation'::cqc."ServicesCapacityType"))
                          GROUP BY "Establishment"."EstablishmentID", "ServicesCapacity"."ServiceCapacityID", services.id, services.name, "ServicesCapacity"."Sequence"
                          ORDER BY "Establishment"."EstablishmentID", "ServicesCapacity"."Sequence") "AllEstablishmentCapacityQuestions"
                     LEFT JOIN ( SELECT "EstablishmentCapacity"."EstablishmentID",
                            "EstablishmentCapacity"."ServiceCapacityID",
                            "EstablishmentCapacity"."Answer"
                           FROM (cqc."EstablishmentCapacity"
                             JOIN cqc."ServicesCapacity" ON (("ServicesCapacity"."ServiceCapacityID" = "EstablishmentCapacity"."ServiceCapacityID")))) "AllEstablishmentCapacities" ON ((("AllEstablishmentCapacities"."ServiceCapacityID" = "AllEstablishmentCapacityQuestions"."ServiceCapacityID") AND ("AllEstablishmentCapacities"."EstablishmentID" = "AllEstablishmentCapacityQuestions"."EstablishmentID"))))
                  ORDER BY "AllEstablishmentCapacityQuestions"."EstablishmentID", "AllEstablishmentCapacityQuestions"."Sequence") "EstablishmentMainServicesWithCapacities"
          GROUP BY "EstablishmentMainServicesWithCapacities"."EstablishmentID") "EstablishmentMainServicesWithCapacitiesTwo";


--
-- Name: AddUserTracking AddUserTracking_User_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."AddUserTracking"
    ADD CONSTRAINT "AddUserTracking_User_fk" FOREIGN KEY ("UserFK") REFERENCES cqc."User"("RegistrationID");


--
-- Name: Approvals Approvals_EstablishmentID_fkey; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Approvals"
    ADD CONSTRAINT "Approvals_EstablishmentID_fkey" FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: Approvals Approvals_UserID_fkey; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Approvals"
    ADD CONSTRAINT "Approvals_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES cqc."User"("RegistrationID");


--
-- Name: EstablishmentAudit EstablishmentAudit_User_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentAudit"
    ADD CONSTRAINT "EstablishmentAudit_User_fk" FOREIGN KEY ("EstablishmentFK") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentCapacity EstablishmentServiceCapacity_Establishment_fk1; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentCapacity"
    ADD CONSTRAINT "EstablishmentServiceCapacity_Establishment_fk1" FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentCapacity EstablishmentServiceCapacity_ServiceCapacity_fk1; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentCapacity"
    ADD CONSTRAINT "EstablishmentServiceCapacity_ServiceCapacity_fk1" FOREIGN KEY ("ServiceCapacityID") REFERENCES cqc."ServicesCapacity"("ServiceCapacityID");


--
-- Name: PasswdResetTracking PasswdResetTracking_User_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."PasswdResetTracking"
    ADD CONSTRAINT "PasswdResetTracking_User_fk" FOREIGN KEY ("UserFK") REFERENCES cqc."User"("RegistrationID");


--
-- Name: UserAudit WorkerAudit_User_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."UserAudit"
    ADD CONSTRAINT "WorkerAudit_User_fk" FOREIGN KEY ("UserFK") REFERENCES cqc."User"("RegistrationID");


--
-- Name: WorkerAudit WorkerAudit_Worker_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerAudit"
    ADD CONSTRAINT "WorkerAudit_Worker_fk" FOREIGN KEY ("WorkerFK") REFERENCES cqc."Worker"("ID");


--
-- Name: WorkerJobs WorkerJobs_Job_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerJobs"
    ADD CONSTRAINT "WorkerJobs_Job_fk" FOREIGN KEY ("JobFK") REFERENCES cqc."Job"("JobID");


--
-- Name: WorkerJobs WorkerJobs_Worker_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerJobs"
    ADD CONSTRAINT "WorkerJobs_Worker_fk" FOREIGN KEY ("WorkerFK") REFERENCES cqc."Worker"("ID");


--
-- Name: WorkerQualifications WorkerQualifications_Qualifications_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerQualifications"
    ADD CONSTRAINT "WorkerQualifications_Qualifications_fk" FOREIGN KEY ("QualificationsFK") REFERENCES cqc."Qualifications"("ID");


--
-- Name: WorkerQualifications WorkerQualifications_Worker_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerQualifications"
    ADD CONSTRAINT "WorkerQualifications_Worker_fk" FOREIGN KEY ("WorkerFK") REFERENCES cqc."Worker"("ID");


--
-- Name: WorkerTraining WorkerTraining_Training_Category_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerTraining"
    ADD CONSTRAINT "WorkerTraining_Training_Category_fk" FOREIGN KEY ("CategoryFK") REFERENCES cqc."TrainingCategories"("ID");


--
-- Name: WorkerTraining WorkerTraining_Worker_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."WorkerTraining"
    ADD CONSTRAINT "WorkerTraining_Worker_fk" FOREIGN KEY ("WorkerFK") REFERENCES cqc."Worker"("ID");


--
-- Name: Worker Worker_Establishment_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_Establishment_fk" FOREIGN KEY ("EstablishmentFK") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: Worker Worker_Job_mainjob_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_Job_mainjob_fk" FOREIGN KEY ("MainJobFKValue") REFERENCES cqc."Job"("JobID");


--
-- Name: Worker Worker_country_of_birth_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_country_of_birth_fk" FOREIGN KEY ("CountryOfBirthOtherFK") REFERENCES cqc."Country"("ID");


--
-- Name: Worker Worker_ethnicity_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_ethnicity_fk" FOREIGN KEY ("EthnicityFKValue") REFERENCES cqc."Ethnicity"("ID");


--
-- Name: Worker Worker_highest_qualification_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_highest_qualification_fk" FOREIGN KEY ("HighestQualificationFKValue") REFERENCES cqc."Qualification"("ID");


--
-- Name: Worker Worker_leave_reason_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_leave_reason_fk" FOREIGN KEY ("LeaveReasonFK") REFERENCES cqc."WorkerLeaveReasons"("ID");


--
-- Name: Worker Worker_nationality_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_nationality_fk" FOREIGN KEY ("NationalityOtherFK") REFERENCES cqc."Nationality"("ID");


--
-- Name: Worker Worker_recruited_from_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_recruited_from_fk" FOREIGN KEY ("RecruitedFromOtherFK") REFERENCES cqc."RecruitedFrom"("ID");


--
-- Name: Worker Worker_social_care_qualification_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Worker"
    ADD CONSTRAINT "Worker_social_care_qualification_fk" FOREIGN KEY ("SocialCareQualificationFKValue") REFERENCES cqc."Qualification"("ID");


--
-- Name: ServicesCapacity constr_srvcid_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."ServicesCapacity"
    ADD CONSTRAINT constr_srvcid_fk FOREIGN KEY ("ServiceID") REFERENCES cqc.services(id);


--
-- Name: Login constraint_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Login"
    ADD CONSTRAINT constraint_fk FOREIGN KEY ("RegistrationID") REFERENCES cqc."User"("RegistrationID");


--
-- Name: Establishment establishment_establishment_parent_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Establishment"
    ADD CONSTRAINT establishment_establishment_parent_fk FOREIGN KEY ("ParentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentJobs establishment_establishmentjobs_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentJobs"
    ADD CONSTRAINT establishment_establishmentjobs_fk FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentLocalAuthority establishment_establishmentlocalauthority_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentLocalAuthority"
    ADD CONSTRAINT establishment_establishmentlocalauthority_fk FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentServiceUsers establishment_establishmentserviceusers_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentServiceUsers"
    ADD CONSTRAINT establishment_establishmentserviceusers_fk FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: MandatoryTraining establishment_mandatory_training_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT establishment_mandatory_training_fk FOREIGN KEY ("EstablishmentFK") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: OwnerChangeRequest establishment_owner_change_request_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."OwnerChangeRequest"
    ADD CONSTRAINT establishment_owner_change_request_fk FOREIGN KEY ("subEstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: LinkToParent establishment_parent_establishment_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LinkToParent"
    ADD CONSTRAINT establishment_parent_establishment_fk FOREIGN KEY ("ParentEstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: LinkToParent establishment_permission_request_created_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LinkToParent"
    ADD CONSTRAINT establishment_permission_request_created_by_fk FOREIGN KEY ("CreatedByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: LinkToParent establishment_sub_establishment_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LinkToParent"
    ADD CONSTRAINT establishment_sub_establishment_fk FOREIGN KEY ("SubEstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentServices estsrvc_estb_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentServices"
    ADD CONSTRAINT estsrvc_estb_fk FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: EstablishmentServices estsrvc_services_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentServices"
    ADD CONSTRAINT estsrvc_services_fk FOREIGN KEY ("ServiceID") REFERENCES cqc.services(id);


--
-- Name: MandatoryTraining job_mandatory_training_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT job_mandatory_training_fk FOREIGN KEY ("JobFK") REFERENCES cqc."Job"("JobID");


--
-- Name: EstablishmentJobs jobs_establishmentjobs_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentJobs"
    ADD CONSTRAINT jobs_establishmentjobs_fk FOREIGN KEY ("JobID") REFERENCES cqc."Job"("JobID");


--
-- Name: Establishment mainserviceid_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Establishment"
    ADD CONSTRAINT mainserviceid_fk FOREIGN KEY ("MainServiceFKValue") REFERENCES cqc.services(id) MATCH FULL;


--
-- Name: Notifications notifications_user_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."Notifications"
    ADD CONSTRAINT notifications_user_fk FOREIGN KEY ("recipientUserUid") REFERENCES cqc."User"("UserUID");


--
-- Name: EstablishmentServiceUsers serviceusers_establishmentserviceusers_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."EstablishmentServiceUsers"
    ADD CONSTRAINT serviceusers_establishmentserviceusers_fk FOREIGN KEY ("ServiceUserID") REFERENCES cqc."ServiceUsers"("ID");


--
-- Name: User user_establishment_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."User"
    ADD CONSTRAINT user_establishment_fk FOREIGN KEY ("EstablishmentID") REFERENCES cqc."Establishment"("EstablishmentID");


--
-- Name: MandatoryTraining user_mandatory_training_created_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT user_mandatory_training_created_by_fk FOREIGN KEY ("CreatedByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: OwnerChangeRequest user_owner_change_request_created_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."OwnerChangeRequest"
    ADD CONSTRAINT user_owner_change_request_created_by_fk FOREIGN KEY ("createdByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: OwnerChangeRequest user_owner_change_request_updated_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."OwnerChangeRequest"
    ADD CONSTRAINT user_owner_change_request_updated_by_fk FOREIGN KEY ("updatedByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: MandatoryTraining user_owner_change_request_updated_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT user_owner_change_request_updated_by_fk FOREIGN KEY ("UpdatedByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: LinkToParent user_permission_request_updated_by_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."LinkToParent"
    ADD CONSTRAINT user_permission_request_updated_by_fk FOREIGN KEY ("UpdatedByUserUID") REFERENCES cqc."User"("UserUID");


--
-- Name: MandatoryTraining worker_training_mandatory_training_category_fk; Type: FK CONSTRAINT; Schema: cqc; Owner: -
--

ALTER TABLE ONLY cqc."MandatoryTraining"
    ADD CONSTRAINT worker_training_mandatory_training_category_fk FOREIGN KEY ("TrainingCategoryFK") REFERENCES cqc."TrainingCategories"("ID");

--
-- PostgreSQL database dump complete
--

