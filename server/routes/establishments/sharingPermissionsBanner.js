const router = require('express').Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');

const sharingPermissionsBanner = async (req, res) => {
  const thisEstablishment = new Establishment.Establishment(req.username);
  await updateSharingPermissionsBanner(req, res, thisEstablishment);
};

const updateSharingPermissionsBanner = async (req, res, establishment) => {
  const establishmentId = req.establishmentId;

  try {
    if (await establishment.restore(establishmentId)) {
      const isValidEstablishment = await establishment.load({
        showSharingPermissionsBanner: req.body.showPermissionsBannerFlag,
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

router.route('/').post(hasPermission('canEditEstablishment'), sharingPermissionsBanner);

module.exports = router;
module.exports.sharingPermissionsBanner = sharingPermissionsBanner;
module.exports.updateSharingPermissionsBanner = updateSharingPermissionsBanner;
