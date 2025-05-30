const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

const getAllCareWorkforcePathwayWorkplaceAwarenessAnswers = async (req, res) => {
  try {
    const result = await models.careWorkforcePathwayWorkplaceAwareness.findAll({
      order: [['seq', 'ASC']],
    });

    res.status(200);

    return res.send({
      careWorkforcePathwayWorkplaceAwarenessAnswers: careWorkforcePathwayWorkplaceAwarenessAnswersJSON(result),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }

  function careWorkforcePathwayWorkplaceAwarenessAnswersJSON(giveCareWorkforcePathwayWorkplaceAwarenessAnswers) {
    let careWorkforcePathwayWorkplaceAwarenessAnswers = [];

    giveCareWorkforcePathwayWorkplaceAwarenessAnswers.forEach((thisCareWorkforcePathwayWorkplaceAwarenessAnswer) => {
      careWorkforcePathwayWorkplaceAwarenessAnswers.push({
        id: thisCareWorkforcePathwayWorkplaceAwarenessAnswer.id,
        title: thisCareWorkforcePathwayWorkplaceAwarenessAnswer.title,
      });
    });
    return careWorkforcePathwayWorkplaceAwarenessAnswers;
  }
};

router.route('/').get(getAllCareWorkforcePathwayWorkplaceAwarenessAnswers);
module.exports = router;
module.exports.getAllCareWorkforcePathwayWorkplaceAwarenessAnswers =
  getAllCareWorkforcePathwayWorkplaceAwarenessAnswers;
