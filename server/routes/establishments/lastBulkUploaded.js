const express = require('express');
const router = express.Router();
const models = require('../../models');

const lastBulkUploaded = async function (req, res) {
  try {
    const lastBulkUploaded = await models.establishment.lastBulkUploaded(req.establishmentId);
    return res.status(200).json(lastBulkUploaded);
  } catch (err) {
    return res.status(500).send();
  }
};

router.route('/').get(lastBulkUploaded);

module.exports = router;
module.exports.lastBulkUploaded = lastBulkUploaded;
