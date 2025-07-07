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
    };

    const users = await models.user.searchUsers(where);
    const results = await UserTransformer(users);
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
