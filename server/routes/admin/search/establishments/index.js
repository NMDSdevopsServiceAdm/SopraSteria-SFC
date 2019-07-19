const express = require('express');
const router = express.Router();
const models = require('../../../../models');


// search for establishments using wildcard on postcode and NMDS ID
router.route('/').post(async function (req, res) {
  const establishmentSearchFields = req.body;

  let searchFilter = null;
  const postcodeSearchField = establishmentSearchFields.postcode ? establishmentSearchFields.postcode.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;
  const nmdsIdSearchField = establishmentSearchFields.nmdsId ? establishmentSearchFields.nmdsId.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;


  if (establishmentSearchFields && establishmentSearchFields.postcode) {
    // search on postcode
    searchFilter = {
      postcode: {
        [models.Sequelize.Op.iLike] : postcodeSearchField
      },
      archived: false,
    };
  } else if (establishmentSearchFields && establishmentSearchFields.nmdsId) {
    // search on NDMS ID
    searchFilter = {
      nmdsId: {
        [models.Sequelize.Op.iLike] : nmdsIdSearchField
      },
      archived: false,
    };
  } else {
    // no search
    return res.status(200).send({});
  }

  try {
    let results = await models.establishment.findAll({
        attributes: ['uid', 'locationId', 'nmdsId', 'postcode', 'isRegulated', 'address1', 'isParent', 'NameValue', 'updated'],
        where:searchFilter,
        order: [
          ['NameValue', 'ASC']
        ]
      });

    res.status(200).send(results.map(thisEstablishment => {
      return {
        uid: thisEstablishment.uid,
        name: thisEstablishment.NameValue,
        nmdsId: thisEstablishment.nmdsId,
        postcode: thisEstablishment.postcode,
        isRegulated: thisEstablishment.isRegulated,
        address: thisEstablishment.address1,
        isParent: thisEstablishment.isParent,
        locationId: thisEstablishment.locationId,
        lastUpdated: thisEstablishment.updated
      };
    }));

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

module.exports = router;
