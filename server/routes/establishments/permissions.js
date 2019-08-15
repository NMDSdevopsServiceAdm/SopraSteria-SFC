const express = require('express');
const router = express.Router({mergeParams: true});
const Establishment = require('../../models/classes/establishment');

const PermissionCache = require('../../models/cache/singletons/permissions').PermissionCache;

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId)) {
        return res.status(200).json({
            uid: thisEstablishment.uid,
            permissions: Object.assign({}, ...PermissionCache.myPermissions(thisEstablishment.dataOwner, thisEstablishment.dataPermissions, req.role).map((item) => {
                return { [item.code]: true }
            }))
        });
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

    console.error('establishment::permissions GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

module.exports = router;