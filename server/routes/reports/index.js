// default route for reports
const express = require('express');
const router = express.Router();

const WDF = require('./wdf');

// ensure all establishment routes are authorised
router.use('/wdf', WDF);

router.route('/').get(async (req, res) => {
    return res.status(501).send();
});

module.exports = router;
