const router = require('express').Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');

const establishmentBanner = async (req, res) => {
  const thisEstablishment = new Establishment.Establishment(req.username);
  await updateEstablishmentBanner(req, res, thisEstablishment);
};

const updateEstablishmentBanner = async (req, res, establishment) => {
  const establishmentId = req.establishmentId;

  try {
    const { property, value } = req.body;
    if (await establishment.restore(establishmentId)) {
      const isValidEstablishment = await establishment.load({
        [property]: value,
      });

      if (isValidEstablishment) {
        await establishment.save(req.username);
        return res.status(200).json(establishment.toJSON(false, false, false, false));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      return res.status(401).send('Not Found');
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

router.route('/').post(hasPermission('canEditEstablishment'), establishmentBanner);

module.exports = router;
module.exports.updateEstablishmentBanner = updateEstablishmentBanner;
