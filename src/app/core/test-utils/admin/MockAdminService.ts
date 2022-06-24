import { build, fake } from '@jackfranklin/test-data-bot/build';

export const AdminUser = build('AdminUser', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    fullname: fake((f) => f.name.findName()),
    role: 'Admin',
    email: fake((f) => f.internet.email),
    phone: fake((f) => f.phone.phoneNumber()),
    jobTitle: fake((f) => f.name.jobTitle),
    username: fake((f) => f.internet.userName),
    updated: '01/02/2022',
    isPrimary: null,
    status: 'Active',
  },
});

export const AdminManagerUser = () => {
  return AdminUser({
    overrides: {
      role: 'AdminManager',
    },
  });
};

export const PendingAdminUser = () => {
  return AdminUser({
    overrides: {
      status: 'Pending',
      username: '',
    },
  });
};
