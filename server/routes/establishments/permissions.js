const express = require('express');
const router = express.Router({ mergeParams: true });
const { PermissionCache } = require('../../models/cache/singletons/permissions');

router.route('/').get(async (req, res) => {
  return await permissions(req, res);
});
const permissions = async (req, res) => {
  try {
    await permissionsCheck(req, res);
  } catch (thisError) {
    console.error('establishment::permissions GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
};

const permissionsCheck = async (req, res) => {
  const permissions = await PermissionCache.myPermissions(req);
  return res.status(200).json({
    uid: req.establishment.uid,
    permissions: Object.assign({}, ...permissions),
  });
};

module.exports = router;
module.exports.permissions = permissions;
module.exports.permissionsCheck = permissionsCheck;
