const express = require('express');
const router = express.Router({mergeParams: true});
const Establishment = require('../../models/classes/establishment');

const PermissionCache = require('../../models/cache/singletons/permissions').PermissionCache;

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId)) {
        const permissions = await PermissionCache.myPermissions(req).map((item) => {
          if(item.code === "canChangeDataOwner" && thisEstablishment.dataOwnershipRequested !== null){
            return { [item.code]: false };
          }else{
            return { [item.code]: true };
          }
        })
        return res.status(200).json({
            uid: thisEstablishment.uid,
            permissions: Object.assign({}, ...permissions)
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
