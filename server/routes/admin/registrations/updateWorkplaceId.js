const models = require('../../../models');

const updateWorkplaceId = async (req, res) => {
  try {
    const nmdsId = req.body.nmdsId;
    const workplaceIdIsUnique = await newWorkplaceIdIsUnique(req.body.uid, nmdsId);

    if (!workplaceIdIsUnique) {
      return res.status(400).json({
        nmdsId: `This workplace ID (${nmdsId}) belongs to another workplace, enter a different workplace ID`,
      });
    }
    const workplace = await models.establishment.findByUid(req.body.uid);

    workplace.nmdsId = nmdsId;
    workplace.save();

    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

const newWorkplaceIdIsUnique = async (establishmentUid, nmdsId) => {
  const workplaceWithDuplicateId = await models.establishment.findEstablishmentWithSameNmdsId(establishmentUid, nmdsId);

  return workplaceWithDuplicateId === null;
};

const router = require('express').Router();

router.route('/').post(updateWorkplaceId);

module.exports = router;
module.exports.updateWorkplaceId = updateWorkplaceId;
