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
          attributes: ['id', 'cssrId', 'cssr'],
        }
      ]
    });

    // need to identify which, if any, of the shared authorities is attributed to the
    //  primary Authority; that is the Local Authority associated with the physical area
    //  of the given Establishment (using the postcode as the key)
    let primaryAuthorityCssr = null;

    if (results && results.postcode) {
      //  using just the first half of the postcode
      const [firstHalfOfPostcode] = results.postcode.split(' '); 
      
      // must escape the string to prevent SQL injection
      const fuzzyCssrIdMatch = await models.sequelize.query(
        `select "Cssr"."CssrID", "Cssr"."CssR" from cqc.pcodedata, cqc."Cssr" where postcode like \'${escape(firstHalfOfPostcode)}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR" limit 1`,
        {
          type: models.sequelize.QueryTypes.SELECT
        }
      );
      if (fuzzyCssrIdMatch && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0].CssrID) {
        primaryAuthorityCssr = {
          id: fuzzyCssrIdMatch[0].CssrID,
          name: fuzzyCssrIdMatch[0].CssR
        }
      }
    }

    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatLAResponse(results, primaryAuthorityCssr));
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
      // when processing the local authorities, we need to ensure they are one of the known local authorities (CSSRs)
      const allLAResult =  await models.cssr.findAll({
        attributes: ['id', 'name'],
        group: ['id', 'name'],
        order: [
          ['name', 'ASC']
        ]
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

        // now iterate through the given set of LAs
        const laRecords = [];
        givenLocalAuthorities.forEach(thisLA => {
          if (isValidLAEntry(thisLA, allLAs)) {
            const associatedCssr = allLAResult.find(thisCssr => {
              return thisCssr.id == thisLA.custodianCode
            });

            laRecords.push(
              models.establishmentLocalAuthority.create({
                cssrId: thisLA.custodianCode,
                cssr: associatedCssr.name,
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
            attributes: ['id', 'cssrId', 'cssr'],
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
    return res.status(503).send(`Unable to update Establishment with local authorities: ${req.params.id}`);
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
  console.log("WA DEBUG: primary authority: ", primaryAuthority)
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes
  const response = {
    id: establishment.id,
    name: establishment.name,
    localAuthorities: LaFormatters.listOfLAsJSON(establishment.localAuthorities,
                                                 primaryAuthority && primaryAuthority.id ? primaryAuthority.id : null)
  };

  if (primaryAuthority) {
    response.primaryAuthority = {
      custodianCode: parseInt(primaryAuthority.id),
      name: primaryAuthority.name
    }
  }

  return response;
}

module.exports = router;