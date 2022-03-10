const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('./../../models');

const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');

const isFirstBulkUpload = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, false)) {
      if (thisEstablishment.localIdentifier) {
        return res.status(200).json({
          isFirstBulkUpload: false,
        });
      } else {
        return res.status(200).json({
          isFirstBulkUpload: true,
        });
      }
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
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::localIdentifier GET/:eID - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const getMissingLocalIdentifierCount = async (req, res) => {
  try {
    const establishmentCount = await models.establishment.getMissingEstablishmentRefCount(
      req.establishmentId,
      req.isParent,
    );
    const workerCount = await models.establishment.getMissingWorkerRefCount(req.establishmentId, req.isParent);
    const establishmentsWithMissingWorkerRef = await models.establishment.getEstablishmentsWithMissingWorkerRef(
      req.establishmentId,
      req.isParent,
    );

    const uniqueEstablishments = establishmentsWithMissingWorkerRef.map((f) => {
      return { uid: f.uid, name: f.NameValue };
    });

    return res.status(200).json({
      establishment: establishmentCount,
      worker: workerCount,
      establishmentList: uniqueEstablishments,
    });
  } catch (_) {
    return res.status(500).send();
  }
};

router.route('/').get(hasPermission('canBulkUpload'), isFirstBulkUpload);
router.route('/missing').get(hasPermission('canBulkUpload'), getMissingLocalIdentifierCount);

module.exports = router;
