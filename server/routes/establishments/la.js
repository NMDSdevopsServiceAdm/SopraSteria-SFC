const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const LaFormatters = require('../../models/api/la');

// parent route defines the "id" parameter

// TODO: refactor the get/pull - sharing fetch queries

// gets current set of Local Authorities to share with for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', "postcode"],
      include: [
        {
          model: models.establishmentLocalAuthority,
          as: 'localAuthorities',
          attributes: ['id'],
          include: [{
            model: models.localAuthority,
            as: 'reference',
            attributes: ['custodianCode', 'name'],
            order: [
              ['name', 'ASC']
            ]
          }]
        }
      ]
    });

    // need to identify which, if any, of the shared authorities is attributed to the
    //  primary Authority; that is the Local Authority associated with the physical area
    //  of the given Establishment (using the postcode as the key)
    const primaryAuthority = await models.pcodedata.findOne({
      where: {
        postcode: results.postcode
      },
      attributes: ['postcode', 'local_custodian_code'],
      include: {
        model: models.localAuthority,
        as: 'theAuthority',
        attributes: ['name']
      }
    });
    //const primaryAuthorityCustodianCode = primaryAuthority.local_custodian_code;

    if (results && results.id && (establishmentId === results.id) && primaryAuthority.theAuthority && primaryAuthority.theAuthority) {
      res.status(200);
      return res.json(formatLAResponse(results, primaryAuthority));
    } else {
      // Note - which pcodedata being external reference data and with a user being
      //        able to enter address details not found in pcoddata, it will not be
      //        uncommon as initially thought to not resolve on primary authority

      // Rather than erroring, primary authority will be null
      res.status(200);
      return res.json(formatLAResponse(results, null));
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::jobs GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the set of Local Authorities to share with for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const givenLocalAuthorities = req.body.localAuthorities;

  // must provide localAuthorities and must be an array
  if (!givenLocalAuthorities || !Array.isArray(givenLocalAuthorities)) {
    console.error('establishment::la POST - unexpected Local Authorities: ', givenLocalAuthorities);
    return res.status(400).send(`Unexpected Local Authorities: ${givenLocalAuthorities}`);
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name']
    });

    if (results && results.id && (establishmentId === results.id)) {
      // when processing the local authorities, we need to ensure they are one of the known local authorities
      const allLAResult = await models.localAuthority.findAll({
        attributes: ['custodianCode']
      });
      if (!allLAResult) {
        console.error('establishment::la POST - unable to retrieve all known local authorities');
        return res.status(503).send('Unable to retrieve all Local Authorities');
      }
      const allLAs = [];
      allLAResult.forEach(thisRes => allLAs.push(thisRes.custodianCode));

      await models.sequelize.transaction(async t => {
        await models.establishmentLocalAuthority.destroy({
          where: {
            establishmentId
          }
        });

        // now iterate through the given set of LAs0
        const laRecords = [];
        givenLocalAuthorities.forEach(thisLA => {
          if (isValidLAEntry(thisLA, allLAs)) {
            laRecords.push(
              models.establishmentLocalAuthority.create({
                authorityId: thisLA.custodianCode,
                establishmentId
              })
            );
          }
        });
        await Promise.all(laRecords);
      });

      // now need to refetch the associated local authorities to return the confirmation
      let reFetchResults = await models.establishment.findOne({
        where: {
          id: establishmentId
        },
        attributes: ['id', 'name', "postcode"],
        include: [
          {
            model: models.establishmentLocalAuthority,
            as: 'localAuthorities',
            attributes: ['id'],
            include: [{
              model: models.localAuthority,
              as: 'reference',
              attributes: ['custodianCode', 'name'],
              order: [
                ['name', 'ASC']
              ]
            }]
          }
        ]
      });
  
      if (reFetchResults && reFetchResults.id && (establishmentId === reFetchResults.id)) {
        res.status(200);
        return res.json(formatLAResponse(reFetchResults));
      } else {
        console.error('establishment::la POST - Not found establishment having id: ${establishmentId} after having updated the establishment', err);
        return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
      }
    } else {
      console.error('establishment::la POST - Not found establishment having id: ${establishmentId}', err);
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::la POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with local authorities: ${req.params.id}/${givenEmployerType}`);
  }
});


// TODO - ensure the jobId is valid
const isValidLAEntry = (entry, allKnownLAs) => {
  if (entry && 
      entry.custodianCode &&
      parseInt(entry.custodianCode) === entry.custodianCode) {

      // now check the LA custodianCode is within range
      if (allKnownLAs &&
          Array.isArray(allKnownLAs) &&
          allKnownLAs.includes(entry.custodianCode)) {
        return true;
      } else {
        return false;
      }
  } else {
    return false;
  }
};

const formatLAResponse = (establishment, primaryAuthority=null) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes
  const response = {
    id: establishment.id,
    name: establishment.name,
    localAuthorities: LaFormatters.listOfLAsJSON(establishment.localAuthorities,
                                                 primaryAuthority ? primaryAuthority.local_custodian_code : null)
  };

  if (primaryAuthority) {
    response.primaryAuthority = {
      custodianCode: parseInt(primaryAuthority.local_custodian_code),
      name: primaryAuthority.theAuthority.name
    }
  } else {
    response.primaryAuthority = {};
  }

  return response;
}

module.exports = router;