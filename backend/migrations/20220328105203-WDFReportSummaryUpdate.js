'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS cqc.wdfsummaryreport');
    await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION cqc.wdfsummaryreport(IN effectivedate date)
    RETURNS TABLE("NmdsID" text, "EstablishmentID" integer, "EstablishmentName" text, "Address1" text, "Address2" text, "PostCode" text, "Region" text, "CSSR" text, "EstablishmentUpdated" timestamp with time zone, "NumberOfStaff" integer, "ParentID" integer, "OverallWdfEligibility" timestamp with time zone, "ParentNmdsID" text, "ParentEstablishmentID" integer, "ParentName" text, "WorkerCount" bigint, "WorkerCompletedCount" bigint)
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100    ROWS 1000
AS $BODY$
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
where "Establishment"."Archived"=false and "Establishment"."Status" is null
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
END;
$BODY$;`);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS cqc.wdfsummaryreport');
  },
};
