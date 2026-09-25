const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const UserTransformer = require('../../../../transformers/adminSearchTransformer').UserTransformer;

const search = async function (req, res) {
  try {
    const where = {
      name: req.body.name,
      username: req.body.username,
      emailAddress: req.body.emailAddress,
      phoneNumber: req.body.phoneNumber,
    };

    if (!hasSearchCriteria(where)) {
      return res.status(200).json([]);
    }

    const users = await models.user.searchUsers(where);

    const results = await UserTransformer(users);

    return res.status(200).json(results);
  } catch (err) {
    console.error('User search failed:', err);
    res.status(500).json([]);
  }
};

const isWildcardOnly = (v) => v === '*';

const hasSearchCriteria = (params) =>
  Object.values(params).some((v) => typeof v === 'string' && v.trim().length > 0 && !isWildcardOnly(v.trim()));

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
