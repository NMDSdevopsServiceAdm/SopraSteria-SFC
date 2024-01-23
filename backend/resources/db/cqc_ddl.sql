--
-- PostgreSQL database dump
--

-- Dumped from database version 11.0
-- Dumped by pg_dump version 11.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: sfcdevdb; Type: DATABASE; Schema: -; Owner: sfcadmin
--

CREATE DATABASE sfcdevdb WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


ALTER DATABASE sfcdevdb OWNER TO sfcadmin;

--\connect sfcdevdb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cqc; Type: SCHEMA; Schema: -; Owner: sfcadmin
--

CREATE SCHEMA cqc;


ALTER SCHEMA cqc OWNER TO sfcadmin;

SET default_tablespace = sfcdevtbs_logins;

SET default_with_oids = false;

--
-- Name: Establishment; Type: TABLE; Schema: cqc; Owner: sfcadmin; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc."Establishment" (
    "EstablishmentID" integer NOT NULL,
    "Name" text,
    "Address" text,
    "LocationID" text,
    "PostCode" text,
    "MainService" text,
    "IsRegulated" boolean NOT NULL
);


ALTER TABLE cqc."Establishment" OWNER TO sfcadmin;

--
-- Name: Establishment_EstablishmentID_seq; Type: SEQUENCE; Schema: cqc; Owner: sfcadmin
--

CREATE SEQUENCE cqc."Establishment_EstablishmentID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc."Establishment_EstablishmentID_seq" OWNER TO sfcadmin;

--
-- Name: Establishment_EstablishmentID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: sfcadmin
--

ALTER SEQUENCE cqc."Establishment_EstablishmentID_seq" OWNED BY cqc."Establishment"."EstablishmentID";


--
-- Name: Login; Type: TABLE; Schema: cqc; Owner: sfcadmin; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc."Login" (
    "ID" integer NOT NULL,
    "RegistrationID" integer NOT NULL,
    "Username" character varying(200) NOT NULL,
    "Password" character varying(200) NOT NULL,
    "SecurityQuestion" character varying(200) NOT NULL,
    "SecurityQuestionAnswer" character varying(200) NOT NULL,
    "Active" boolean NOT NULL,
    "InvalidAttempt" integer NOT NULL
);


ALTER TABLE cqc."Login" OWNER TO sfcadmin;

--
-- Name: Login_ID_seq; Type: SEQUENCE; Schema: cqc; Owner: sfcadmin
--

CREATE SEQUENCE cqc."Login_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc."Login_ID_seq" OWNER TO sfcadmin;

--
-- Name: Login_ID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: sfcadmin
--

ALTER SEQUENCE cqc."Login_ID_seq" OWNED BY cqc."Login"."ID";


SET default_tablespace = '';

--
-- Name: TestTable; Type: TABLE; Schema: cqc; Owner: sfcadmin
--

CREATE TABLE cqc."TestTable" (
    "FreeText" text
);


ALTER TABLE cqc."TestTable" OWNER TO sfcadmin;

SET default_tablespace = sfcdevtbs_logins;

--
-- Name: User; Type: TABLE; Schema: cqc; Owner: sfcadmin; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc."User" (
    "RegistrationID" integer NOT NULL,
    "FullName" character varying(200) NOT NULL,
    "JobTitle" character varying(200) NOT NULL,
    "Email" character varying(200) NOT NULL,
    "Phone" character varying(200) NOT NULL,
    "DateCreated" timestamp without time zone NOT NULL,
    "EstablishmentID" integer NOT NULL,
    "AdminUser" boolean NOT NULL
);


ALTER TABLE cqc."User" OWNER TO sfcadmin;

--
-- Name: User_RegistrationID_seq; Type: SEQUENCE; Schema: cqc; Owner: sfcadmin
--

CREATE SEQUENCE cqc."User_RegistrationID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc."User_RegistrationID_seq" OWNER TO sfcadmin;

--
-- Name: User_RegistrationID_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: sfcadmin
--

ALTER SEQUENCE cqc."User_RegistrationID_seq" OWNED BY cqc."User"."RegistrationID";


--
-- Name: cqclog; Type: TABLE; Schema: cqc; Owner: postgres; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc.cqclog (
    id integer NOT NULL,
    success boolean,
    message character varying(255),
    createdat timestamp with time zone NOT NULL
);


ALTER TABLE cqc.cqclog OWNER TO postgres;

--
-- Name: cqclog_id_seq; Type: SEQUENCE; Schema: cqc; Owner: postgres
--

CREATE SEQUENCE cqc.cqclog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc.cqclog_id_seq OWNER TO postgres;

--
-- Name: cqclog_id_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: postgres
--

ALTER SEQUENCE cqc.cqclog_id_seq OWNED BY cqc.cqclog.id;


--
-- Name: location_cqcid_seq; Type: SEQUENCE; Schema: cqc; Owner: sfcadmin
--

CREATE SEQUENCE cqc.location_cqcid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc.location_cqcid_seq OWNER TO sfcadmin;

--
-- Name: location; Type: TABLE; Schema: cqc; Owner: sfcadmin; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc.location (
    cqcid integer DEFAULT nextval('cqc.location_cqcid_seq'::regclass) NOT NULL,
    locationid text,
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


ALTER TABLE cqc.location OWNER TO sfcadmin;

--
-- Name: log_id_seq; Type: SEQUENCE; Schema: cqc; Owner: postgres
--

CREATE SEQUENCE cqc.log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc.log_id_seq OWNER TO postgres;

--
-- Name: pcodedata; Type: TABLE; Schema: cqc; Owner: postgres; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc.pcodedata (
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


ALTER TABLE cqc.pcodedata OWNER TO postgres;

SET default_tablespace = '';

--
-- Name: pcodedata_old; Type: TABLE; Schema: cqc; Owner: postgres
--

CREATE TABLE cqc.pcodedata_old (
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


ALTER TABLE cqc.pcodedata_old OWNER TO postgres;

SET default_tablespace = sfcdevtbs_logins;

--
-- Name: services; Type: TABLE; Schema: cqc; Owner: sfcadmin; Tablespace: sfcdevtbs_logins
--

CREATE TABLE cqc.services (
    id integer NOT NULL,
    name text,
    category text,
    capacityquestion text,
    currentuptakequestion text,
    iscqcregistered boolean
);


ALTER TABLE cqc.services OWNER TO sfcadmin;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: cqc; Owner: sfcadmin
--

CREATE SEQUENCE cqc.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cqc.services_id_seq OWNER TO sfcadmin;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: cqc; Owner: sfcadmin
--

ALTER SEQUENCE cqc.services_id_seq OWNED BY cqc.services.id;


--
-- Name: Establishment EstablishmentID; Type: DEFAULT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."Establishment" ALTER COLUMN "EstablishmentID" SET DEFAULT nextval('cqc."Establishment_EstablishmentID_seq"'::regclass);


--
-- Name: Login ID; Type: DEFAULT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."Login" ALTER COLUMN "ID" SET DEFAULT nextval('cqc."Login_ID_seq"'::regclass);


--
-- Name: User RegistrationID; Type: DEFAULT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."User" ALTER COLUMN "RegistrationID" SET DEFAULT nextval('cqc."User_RegistrationID_seq"'::regclass);


--
-- Name: cqclog id; Type: DEFAULT; Schema: cqc; Owner: postgres
--

ALTER TABLE ONLY cqc.cqclog ALTER COLUMN id SET DEFAULT nextval('cqc.cqclog_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc.services ALTER COLUMN id SET DEFAULT nextval('cqc.services_id_seq'::regclass);


SET default_tablespace = '';

--
-- Name: cqclog CQCLog_pkey; Type: CONSTRAINT; Schema: cqc; Owner: postgres
--

ALTER TABLE ONLY cqc.cqclog
    ADD CONSTRAINT "CQCLog_pkey" PRIMARY KEY (id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (cqcid);


--
-- Name: Login pk_Login; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."Login"
    ADD CONSTRAINT "pk_Login" PRIMARY KEY ("ID");


--
-- Name: User pk_User; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."User"
    ADD CONSTRAINT "pk_User" PRIMARY KEY ("RegistrationID");


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: Login uc_Login_Username; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc."Login"
    ADD CONSTRAINT "uc_Login_Username" UNIQUE ("Username");


--
-- Name: location uniqlocationid; Type: CONSTRAINT; Schema: cqc; Owner: sfcadmin
--

ALTER TABLE ONLY cqc.location
    ADD CONSTRAINT uniqlocationid UNIQUE (locationid);


--
-- Name: TABLE cqclog; Type: ACL; Schema: cqc; Owner: postgres
--

--Grant ALL ON TABLE cqc.cqclog TO sfcadmin;


--
-- Name: SEQUENCE cqclog_id_seq; Type: ACL; Schema: cqc; Owner: postgres
--

--Grant USAGE ON SEQUENCE cqc.cqclog_id_seq TO sfcadmin;


--
-- Name: TABLE pcodedata; Type: ACL; Schema: cqc; Owner: postgres
--

--Grant ALL ON TABLE cqc.pcodedata TO sfcadmin;


--
-- Name: TABLE pcodedata_old; Type: ACL; Schema: cqc; Owner: postgres
--

--Grant ALL ON TABLE cqc.pcodedata_old TO sfcadmin;


--
-- PostgreSQL database dump complete
--

