const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const LaFormatters = require('../../models/api/la');

const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['Name', 'ShareWithLA'];

// gets current set of Local Authorities to share with for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
      // show only brief info on Establishment
      return res
        .status(200)
        .json(
          thisEstablishment.toJSON(
            showHistory,
            showPropertyHistoryOnly,
            showHistoryTime,
            false,
            false,
            filteredProperties,
          ),
        );
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::share GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

router.route('/alt').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId,
      },
      attributes: ['id', 'name', 'postcode'],
      include: [
        {
          model: models.establishmentLocalAuthority,
          as: 'localAuthorities',
          attributes: ['id', 'cssrId', 'cssr'],
        },
      ],
    });

    // need to identify which, if any, of the shared authorities is attributed to the
    //  primary Authority; that is the Local Authority associated with the physical area
    //  of the given Establishment (using the postcode as the key)
    let primaryAuthorityCssr = null;

    if (results && results.postcode) {
      // lookup primary authority by trying to resolve on specific postcode code
      const cssrResults = await models.pcodedata.findOne({
        where: {
          postcode: results.postcode,
        },
        include: [
          {
            model: models.cssr,
            as: 'theAuthority',
            attributes: ['id', 'name', 'nmdsIdLetter'],
          },
        ],
      });

      if (
        cssrResults &&
        cssrResults.postcode === results.postcode &&
        cssrResults.theAuthority &&
        cssrResults.theAuthority.id &&
        Number.isInteger(cssrResults.theAuthority.id)
      ) {
        primaryAuthorityCssr = {
          id: cssrResults.theAuthority.id,
          name: cssrResults.theAuthority.name,
        };
      } else {
        //  using just the first half of the postcode
        const [firstHalfOfPostcode] = results.postcode.split(' ');

        // must escape the string to prevent SQL injection
        const fuzzyCssrIdMatch = await models.sequelize.query(
          `select "Cssr"."CssrID", "Cssr"."CssR" from cqcref.pcodedata, cqc."Cssr" where postcode like \'${escape(
            firstHalfOfPostcode,
          )}%\' and pcodedata.local_custodian_code = "Cssr"."LocalCustodianCode" group by "Cssr"."CssrID", "Cssr"."CssR" limit 1`,
          {
            type: models.sequelize.QueryTypes.SELECT,
          },
        );
        if (fuzzyCssrIdMatch && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0] && fuzzyCssrIdMatch[0].CssrID) {
          primaryAuthorityCssr = {
            id: fuzzyCssrIdMatch[0].CssrID,
            name: fuzzyCssrIdMatch[0].CssR,
          };
        }
      }
    }

    if (results && results.id && establishmentId === results.id) {
      res.status(200);
      return res.json(formatLAResponse(results, primaryAuthorityCssr));
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::jobs GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${escape(req.params.id)}`);
  }
});

// updates the set of Local Authorities to share with for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(establishmentId)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in local authorities
      const isValidEstablishment = await thisEstablishment.load({
        localAuthorities: req.body.localAuthorities,
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        return res.status(200).json(thisEstablishment.toJSON(false, false, false, true, false, filteredProperties));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error('Establishment::share POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error('Establishment::share POST: ', err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error('Unexpected exception: ', err);
    }
  }
});

router.route('/alt').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const givenLocalAuthorities = req.body.localAuthorities;

  // must provide localAuthorities and must be an array
  if (!givenLocalAuthorities || !Array.isArray(givenLocalAuthorities)) {
    console.error('establishment::la POST - unexpected Local Authorities: ', givenLocalAuthorities);
    return res.status(400).send(`Unexpected Local Authorities: ${escape(givenLocalAuthorities)}`);
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId,
      },
      attributes: ['id', 'name'],
    });

    if (results && results.id && establishmentId === results.id) {
      // when processing the local authorities, we need to ensure they are one of the known local authorities (CSSRs)
      const allLAResult = await models.cssr.findAll({
        attributes: ['id', 'name'],
        group: ['id', 'name'],
        order: [['name', 'ASC']],
      });
      if (!allLAResult) {
        console.error('establishment::la POST - unable to retrieve all known local authorities');
        return res.status(503).send('Unable to retrieve all Local Authorities');
      }
      const allLAs = [];
      allLAResult.forEach((thisRes) => allLAs.push(thisRes.id));

      await models.sequelize.transaction(async (t) => {
        await models.establishmentLocalAuthority.destroy(
          {
            where: {
              establishmentId,
            },
          },
          { transaction: t },
        );

        // now iterate through the given set of LAs
        const laRecords = [];
        givenLocalAuthorities.forEach((thisLA) => {
          if (isValidLAEntry(thisLA, allLAs)) {
            const associatedCssr = allLAResult.find((thisCssr) => {
              return thisCssr.id == thisLA.custodianCode;
            });

            laRecords.push(
              models.establishmentLocalAuthority.create(
                {
                  cssrId: thisLA.custodianCode,
                  cssr: associatedCssr.name,
                  establishmentId,
                },
                { transaction: t },
              ),
            );
          }
        });
        await Promise.all(laRecords);
      });

      // now need to refetch the associated local authorities to return the confirmation
      let reFetchResults = await models.establishment.findOne({
        where: {
          id: establishmentId,
        },
        attributes: ['id', 'name', 'postcode'],
        include: [
          {
            model: models.establishmentLocalAuthority,
            as: 'localAuthorities',
            attributes: ['id', 'cssrId', 'cssr'],
          },
        ],
      });

      if (reFetchResults && reFetchResults.id && establishmentId === reFetchResults.id) {
        res.status(200);
        return res.json(formatLAResponse(reFetchResults));
      } else {
        console.error(
          `establishment::la POST - Not found establishment having id: ${establishmentId} after having updated the establishment`,
          err,
        );
        return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
      }
    } else {
      console.error(`establishment::la POST - Not found establishment having id: ${establishmentId}`, err);
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }
  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establishment::la POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with local authorities: ${escape(req.params.id)}`);
  }
});

// TODO - ensure the jobId is valid
const isValidLAEntry = (entry, allKnownLAs) => {
  if (entry && entry.custodianCode && parseInt(entry.custodianCode) === entry.custodianCode) {
    // now check the LA custodianCode is within range
    if (allKnownLAs && Array.isArray(allKnownLAs) && allKnownLAs.includes(entry.custodianCode)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const formatLAResponse = (establishment, primaryAuthority = null) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes
  const response = {
    id: establishment.id,
    name: establishment.name,
    localAuthorities: LaFormatters.listOfLAsJSON(
      establishment.localAuthorities,
      primaryAuthority && primaryAuthority.id ? primaryAuthority.id : null,
    ),
  };

  if (primaryAuthority) {
    response.primaryAuthority = {
      custodianCode: parseInt(primaryAuthority.id),
      name: primaryAuthority.name,
    };
  }

  return response;
};

module.exports = router;
