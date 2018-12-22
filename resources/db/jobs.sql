-- Table: cqc."Job"

-- DROP TABLE cqc."Job";

CREATE TABLE cqc."Job"
(
    "JobID" integer NOT NULL,
    "JobName" text COLLATE pg_catalog."default",
    CONSTRAINT "Job_pkey" PRIMARY KEY ("JobID")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE cqc."Job"
    OWNER to sfcadmin;

insert into cqc."Job" ("JobID", "JobName") values (1, 'Senior Care Worker');
insert into cqc."Job" ("JobID", "JobName") values (2, 'Care Worker');
insert into cqc."Job" ("JobID", "JobName") values (3, 'Community Support and Outreach Work');
insert into cqc."Job" ("JobID", "JobName") values (4, 'Advice Guidance and Advocacy');
insert into cqc."Job" ("JobID", "JobName") values (5, 'Other care-providing job role');
insert into cqc."Job" ("JobID", "JobName") values (6, 'Senior Management');
insert into cqc."Job" ("JobID", "JobName") values (7, 'Middle Management');
insert into cqc."Job" ("JobID", "JobName") values (8, 'First Line Manager');
insert into cqc."Job" ("JobID", "JobName") values (9, 'Registered Manager');
insert into cqc."Job" ("JobID", "JobName") values (10, 'Supervisor');
insert into cqc."Job" ("JobID", "JobName") values (11, 'Managers and staff in care-related but not care-providing roles');
insert into cqc."Job" ("JobID", "JobName") values (12, 'Social Worker');
insert into cqc."Job" ("JobID", "JobName") values (13, 'Occupational Therapist');
insert into cqc."Job" ("JobID", "JobName") values (14, 'Registered Nurse');
insert into cqc."Job" ("JobID", "JobName") values (15, 'Allied Health Professional');
insert into cqc."Job" ("JobID", "JobName") values (15, 'Safeguarding and reviewing officer');
insert into cqc."Job" ("JobID", "JobName") values (16, 'Administrative or office staff not care-providing');
insert into cqc."Job" ("JobID", "JobName") values (17, 'Ancillary staff not care-providing');
insert into cqc."Job" ("JobID", "JobName") values (18, 'Activities worker or co-ordinator');
insert into cqc."Job" ("JobID", "JobName") values (19, 'Occupational therapist assistant');
insert into cqc."Job" ("JobID", "JobName") values (20, 'Other non-care-providing job roles');