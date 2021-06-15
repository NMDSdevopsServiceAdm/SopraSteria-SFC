const express = require('express');
const router = express.Router();

const getTargetedUsers = async (req, res) => {
  return res.status(200).send({totalUsers: 1500});
}

router.route('/').get(getTargetedUsers);

module.exports.router = router;
module.exports.getTargetedUsers = getTargetedUsers;
