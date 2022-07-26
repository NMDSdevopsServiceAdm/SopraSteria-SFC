const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../utils/security/hasPermission');
const Establishment = require('../../models/classes/establishment');
const models = require('../../models');

const updateEstablishment = async (req, res) => {
  if (req.body.property) {
    try {
      const { property, value } = req.body;
      await models.establishment.update(
        {
          [property]: value,
        },
        {
          where: {
            id: req.establishmentId,
          },
        },
      );
      return res.status(200).send();
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

router.route('/').post(hasPermission('canEditEstablishment'), updateEstablishment);

module.exports = router;
module.exports.updateEstablishment = updateEstablishment;
