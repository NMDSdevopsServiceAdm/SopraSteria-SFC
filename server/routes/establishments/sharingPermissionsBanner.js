const router = require('express').Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');

const filteredOptions = ['Name', 'SharingPermissions'];

const sharingPermissionsBanner = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);
  console.log("**** establishmentId ******");
  console.log(establishmentId);
  try {
    if (await thisEstablishment.restore(establishmentId)) {

      const isValidEstablishment = await thisEstablishment.load({
        showSharingPermissionsBanner: req.body.showPermissionsBannerFlag,
      });

      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);
        return res.status(200).json(thisEstablishment.toJSON(false, false, false, false, false, filteredOptions));
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
    }
  }
}

// const sharingPermissionsBanner = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const workplace = await models.establishment.findByUid(id);
//     if (!workplace) {
//       return res.status(400).send({ error: 'Workplace could not be found' });
//     }

//     workplace.showSharingPermissionsBanner = req.body.showPermissionsBannerFlag;
//     await workplace.save()

//     return res.status(200).send();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send();
//   }
// }

router.route('/').post(hasPermission('canEditEstablishment'), sharingPermissionsBanner);

module.exports = router;
module.exports.sharingPermissionsBanner = sharingPermissionsBanner;
