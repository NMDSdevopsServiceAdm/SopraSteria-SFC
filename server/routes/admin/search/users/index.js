const express = require('express');
const router = express.Router();
const models = require('../../../../models');
const UserTransformer = require('../../../../transformers/adminSearchTransformer').UserTransformer;

const search = async function (req, res) {
  console.log('****** search ********');
  try {
    const where = {
      name: req.body.name,
      username: req.body.username,
      emailAddress: req.body.emailAddress,
    };
    console.log(where);

    const users = await models.user.searchUsers(where);
    console.log('******* users ********');
    console.log(users);
    const results = await UserTransformer(users);
    console.log('********* results *********');
    console.log(results);
    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').post(search);

module.exports = router;
module.exports.search = search;
