const express = require('express');
const models = require('../models');

const router = express.Router();

const getAllCareWorkforcePathwayUseReasons = async (_req, res) => {
  try {
    const allReasons = await models.CareWorkforcePathwayReasons.findAll({
      order: [['seq', 'ASC']],
      attributes: ['id', 'text', 'isOther'],
      raw: true,
    });
    return res.status(200).send({ allReasons });
  } catch (err) {
    console.error('GET /careWorkforcePathway/useReasons - failed', err);

    return res.status(500).send('');
  }
};

router.route('/');
router.get('/useReasons', getAllCareWorkforcePathwayUseReasons);

module.exports = { careWorkforcePathwayRouter: router, getAllCareWorkforcePathwayUseReasons };
