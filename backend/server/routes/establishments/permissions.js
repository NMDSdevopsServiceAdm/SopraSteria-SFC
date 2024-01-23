const express = require('express');
const router = express.Router({ mergeParams: true });
const permissions = require('../../utils/security/permissions');

const permissionsCheck = async (req, res) => {
  try {
    const userPerms = await permissions.getPermissions(req);
    return res.status(200).json({
      uid: req.establishment.uid,
      permissions: userPerms,
    });
  } catch (thisError) {
    console.error('establishment::permissions GET/:eID - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

router.route('/').get(permissionsCheck);

module.exports = router;
module.exports.permissionsCheck = permissionsCheck;
