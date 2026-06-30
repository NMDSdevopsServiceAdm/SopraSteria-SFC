const hasPermissionModule = require('./hasPermission');

const hasPermissionToUpdateProfile = async (req, res, next) => {
  const userToUpdate = req?.params?.userId;
  const userWhoRequestTheChange = req?.user?.id;

  if (userWhoRequestTheChange !== undefined && userToUpdate === userWhoRequestTheChange) {
    next();
  } else {
    const checkForEditUserPermission = hasPermissionModule.hasPermission('canEditUser');
    return checkForEditUserPermission(req, res, next);
  }
};

module.exports = { hasPermissionToUpdateProfile };
