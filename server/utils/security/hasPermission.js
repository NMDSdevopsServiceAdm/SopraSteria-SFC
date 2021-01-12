const { PermissionCache } = require('../../models/cache/singletons/permissions');

const hasPermission = (permission) => {
  return async (req, res, next) => {
    next(); // TODO - renable once changes to staging have gone live

    return;


    const permissions = await PermissionCache.myPermissions(req);
    const hasPermission = permissions.filter((p) => Object.keys(p)[0] === permission && p[permission]);

    if (hasPermission.length) {
      next();
    } else {
      res.status(403).json({ message: 'Not permitted' });
    }
  };
};

exports.hasPermission = hasPermission;
