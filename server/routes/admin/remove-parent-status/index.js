const express = require('express');
const models = require('../../../models');
const router = express.Router({ mergeParams: true });

const removeParentStatus = async (req, res) => {
  try {
    const { establishmentId } = req.body;
    const workplace = await models.establishment.findByUid(establishmentId);
    await models.establishment.updateEstablishment(workplace.id, {
      isParent: false,
    });
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
};

router.route('/').post(removeParentStatus);

module.exports = router;
module.exports.removeParentStatus = removeParentStatus;
