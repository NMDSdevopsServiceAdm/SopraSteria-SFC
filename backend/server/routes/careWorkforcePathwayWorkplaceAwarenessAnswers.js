const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

const getAllCareWorkforcePathwayWorkplaceAwarenessAnswers = async (req, res) => {
  try {
    const result = await models.careWorkforcePathwayWorkplaceAwareness.findAll({
      attributes: ['id', 'title'],
      order: [['seq', 'ASC']],
    });

    res.status(200);

    return res.send({
      careWorkforcePathwayWorkplaceAwarenessAnswers: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
};

router.route('/').get(getAllCareWorkforcePathwayWorkplaceAwarenessAnswers);
module.exports = router;
module.exports.getAllCareWorkforcePathwayWorkplaceAwarenessAnswers =
  getAllCareWorkforcePathwayWorkplaceAwarenessAnswers;
