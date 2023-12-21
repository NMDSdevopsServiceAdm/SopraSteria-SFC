const adminRoles = ['Admin', 'AdminManager'];

const isAdminRole = (role) => adminRoles.includes(role);

module.exports = {
  adminRoles,
  isAdminRole,
};
