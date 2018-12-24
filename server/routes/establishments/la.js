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
      attributes: ['id', 'name'],
      include: [
        {
          model: models.establishmentLocalAuthority,
          as: 'localAuthorities',
          attributes: ['id'],
          include: [{
            model: models.localAuthority,
            as: 'reference',
            attributes: ['id', 'name'],
            order: [
              ['name', 'ASC']
            ]
          }]
        }
      ]
    });

    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatLAResponse(results));
    } else {
      return res.status(404).send('Not found');
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
        attributes: ['id']
      });
      if (!allLAResult) {
        console.error('establishment::la POST - unable to retrieve all known local authorities');
        return res.status(503).send('Unable to retrieve all Local Authorities');
      }
      const allLAs = [];
      allLAResult.forEach(thisRes => allLAs.push(thisRes.id));

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
                authorityId: thisLA.id,
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
        attributes: ['id', 'name'],
        include: [
          {
            model: models.establishmentLocalAuthority,
            as: 'localAuthorities',
            attributes: ['id'],
            include: [{
              model: models.localAuthority,
              as: 'reference',
              attributes: ['id', 'name'],
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
      entry.id &&
      parseInt(entry.id) === entry.id) {

      // now check the LA id is within range
      if (allKnownLAs &&
          Array.isArray(allKnownLAs) &&
          allKnownLAs.includes(entry.id)) {
        return true;
      } else {
        return false;
      }
  } else {
    return false;
  }
};

const formatLAResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes
  return {
    id: establishment.id,
    name: establishment.name,
    localAuthorities: LaFormatters.listOfLAsJSON(establishment.localAuthorities)
  };
}

module.exports = router;