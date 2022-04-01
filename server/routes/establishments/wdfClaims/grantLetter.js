const router = require('express').Router();
const { hasPermission } = require('../../../utils/security/hasPermission');
const { generateDevelopmentFundGrantLetter } = require('./generateDevelopmentFundGrantLetter');

router.route('/').post(generateDevelopmentFundGrantLetter);

module.exports = router;
module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
