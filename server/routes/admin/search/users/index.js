const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const UserTransformer = require('../../../../transformers/adminSearchTransformer').UserTransformer;

// search for users' establishments using wildcard on username and user's name
const search = async function (req, res) {
  try{
    const where = {
      name: req.body.name,
      username: req.body.username
    }

    const users = await models.user.searchUsers(where);
    const results = await UserTransformer(users);

    return res.status(200).json(results);
  } catch (err) {
    return res.status(503).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
