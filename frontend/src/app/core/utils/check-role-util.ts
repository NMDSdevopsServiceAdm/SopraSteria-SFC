import { Roles } from '@core/model/roles.enum';

export const isAdminRole = (role: string): boolean => {
  const adminRoles = [Roles.Admin.toString(), Roles.AdminManager.toString()];
  return adminRoles.includes(role);
};
