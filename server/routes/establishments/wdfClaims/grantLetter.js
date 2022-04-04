const router = require('express').Router();
const { hasPermission } = require('../../../utils/security/hasPermission');
const {
  generateDevelopmentFundGrantLetter,
  getDevelopmentFundGrantStatus,
} = require('./generateDevelopmentFundGrantLetter');

router.route('/').post(generateDevelopmentFundGrantLetter);
router.route('/').get(getDevelopmentFundGrantStatus);

module.exports = router;
module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
module.exports.getDevelopmentFundGrantStatus = getDevelopmentFundGrantStatus;
