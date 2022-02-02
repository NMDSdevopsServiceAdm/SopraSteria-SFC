const { getPermissions } = require('./permissions');

const hasPermission = (permission) => {
  return async (req, res, next) => {
    const permissions = await getPermissions(req);

    if (permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ message: 'Not permitted' });
    }
  };
};

exports.hasPermission = hasPermission;
