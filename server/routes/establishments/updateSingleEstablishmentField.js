const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../utils/security/hasPermission');
const Establishment = require('../../models/classes/establishment');
const models = require('../../models');

const updateEstablishment = async (req, res) => {
  if (req.body.property) {
    try {
      const where = {
        id: req.establishmentId,
      };

      const { property, value } = req.body;
      await models.establishment.update(
        {
          [property]: value,
        },
        {
          where,
        },
      );
      const attributes = [property];
      const data = await models.establishment.findOne({
        attributes: attributes,
        where,
      });
      return res.status(200).send({ data });
    } catch (err) {
      if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
        console.error('Establishment::share POST: ', err.message);
        return res.status(400).send(err.safe);
      } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
        console.error('Establishment::share POST: ', err.message);
        return res.status(500).send(err.safe);
      } else {
        console.error('Unexpected exception: ', err);
        return res.status(500).send(err.safe);
      }
    }
  } else {
    return res.status(500).json({});
  }
};

const updateEstablishmentWdfEligibility = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId)) {
      const isValidEstablishment = await thisEstablishment.load({
        establishmentWdfEligibility: req.body.establishmentWdfEligibility,
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        return res.status(200);
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error('Establishment::share POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error('Establishment::share POST: ', err.message);
      return res.status(500).send(err.safe);
    } else {
      console.error('Unexpected exception: ', err);
      return res.status(500).send(err.safe);
    }
  }
};

router.route('/').post(hasPermission('canEditEstablishment'), updateEstablishment);
router.route('/EstablishmentWdfEligibility').post(updateEstablishmentWdfEligibility);
module.exports = router;
module.exports.updateEstablishment = updateEstablishment;
module.exports.updateEstablishmentWdfEligibility = updateEstablishmentWdfEligibility;
