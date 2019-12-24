const express = require('express');
const router = express.Router();
const models = require('../../../../models');


// search for establishments using wildcard on postcode and NMDS ID
router.route('/').post(async function (req, res) {
  const establishmentSearchFields = req.body;
  let searchFilter = null;
  const postcodeSearchField = establishmentSearchFields.postcode ? establishmentSearchFields.postcode.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;
  const nmdsIdSearchField = establishmentSearchFields.nmdsId ? establishmentSearchFields.nmdsId.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;
  const locationIdSearchField = establishmentSearchFields.locationid ? establishmentSearchFields.locationid.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;

  try {
    let results = null;
    if (establishmentSearchFields && establishmentSearchFields.postcode) {
      const sqlQuery = `select
          e1."EstablishmentUID" AS "EstablishmentUID",
          e1."LocationID" AS "LocationID",
          e1."NmdsID" AS "NmdsID",
          e1."PostCode" AS "PostCode",
          e1."IsRegulated" AS "IsRegulated",
          e1."Address1" AS "Address",
          e1."IsParent" AS "IsParent",
          e1."NameValue" AS "EstablishmentName",
          e1.updated AS "EstablishmentUpdated",
          e1."ParentID" AS "ParentID",
          e1."Status" AS "Status",
          p1."NmdsID" AS "ParentNmdsID",
          p1."PostCode" AS "ParentPostCode",
          p1."NameValue" AS "ParentName"
        from cqc."Establishment" e1
          left join cqc."Establishment" p1 on e1."ParentID" = p1."EstablishmentID"
        where e1."Archived"=false
          and e1."Status" is NULL
          and e1."PostCode" ilike :searchPostcode
        order by e1."NameValue" ASC`;
      results = await models.sequelize.query(sqlQuery, { replacements: { searchPostcode: postcodeSearchField },type: models.sequelize.QueryTypes.SELECT });
    } else if (establishmentSearchFields && establishmentSearchFields.nmdsId) {
      const sqlQuery = `select
      e1."EstablishmentUID" AS "EstablishmentUID",
      e1."LocationID" AS "LocationID",
      e1."NmdsID" AS "NmdsID",
      e1."PostCode" AS "PostCode",
      e1."IsRegulated" AS "IsRegulated",
      e1."Address1" AS "Address",
      e1."IsParent" AS "IsParent",
      e1."NameValue" AS "EstablishmentName",
      e1.updated AS "EstablishmentUpdated",
      e1."ParentID" AS "ParentID",
      e1."Status" AS "Status",
      p1."NmdsID" AS "ParentNmdsID",
      p1."PostCode" AS "ParentPostCode",
      p1."NameValue" AS "ParentName"
      from cqc."Establishment" e1
      left join cqc."Establishment" p1 on e1."ParentID" = p1."EstablishmentID"
      where e1."Archived"=false
      and e1."Status" is NULL
      and e1."NmdsID" ilike :searchNmdsID
      order by e1."NameValue" ASC`;
      results = await models.sequelize.query(sqlQuery, { replacements: { searchNmdsID: nmdsIdSearchField },type: models.sequelize.QueryTypes.SELECT });
    } else if (establishmentSearchFields && establishmentSearchFields.locationid) {
      const sqlQuery = `select
        e1."EstablishmentUID" AS "EstablishmentUID",
        e1."LocationID" AS "LocationID",
        e1."NmdsID" AS "NmdsID",
        e1."PostCode" AS "PostCode",
        e1."IsRegulated" AS "IsRegulated",
        e1."Address1" AS "Address",
        e1."IsParent" AS "IsParent",
        e1."NameValue" AS "EstablishmentName",
        e1.updated AS "EstablishmentUpdated",
        e1."ParentID" AS "ParentID",
        e1."Status" AS "Status",
        p1."NmdsID" AS "ParentNmdsID",
        p1."PostCode" AS "ParentPostCode",
        p1."NameValue" AS "ParentName"
      from cqc."Establishment" e1
        left join cqc."Establishment" p1 on e1."ParentID" = p1."EstablishmentID"
      where e1."Archived"=false
        and e1."Status" is NULL
        and e1."LocationID" ilike :searchLocationID
      order by e1."NameValue" ASC`;
      results = await models.sequelize.query(sqlQuery, { replacements: { searchLocationID: locationIdSearchField },type: models.sequelize.QueryTypes.SELECT });
    } else {
      // no search
      return res.status(200).send({});
    }

    res.status(200).send(results.map(thisEstablishment => {
      const parent = thisEstablishment.ParentID ? {
        nmdsId: thisEstablishment.ParentNmdsID,
        name: thisEstablishment.ParentName,
        postcode: thisEstablishment.ParentPostCode,
      } : null;
      return {
        uid: thisEstablishment.EstablishmentUID,
        name: thisEstablishment.EstablishmentName,
        username: thisEstablishment.Username,
        nmdsId: thisEstablishment.NmdsID,
        postcode: thisEstablishment.PostCode,
        isRegulated: thisEstablishment.IsRegulated,
        address: thisEstablishment.Address,
        isParent: thisEstablishment.IsParent,
        parent,
        locationId: thisEstablishment.LocationID,
        lastUpdated: thisEstablishment.EstablishmentUpdated
      };
    }));

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

module.exports = router;