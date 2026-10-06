const UserAccountStatus = {
  Locked: 'Locked',
  Pending: 'PENDING',
};

const MaxLoginAttempts = 10;
const MaxFindUsernameAttempts = 5;

const JobRoleId = {
  REGISTERED_NURSE: 23,
};

const CWPRoleCategoryGroup = {
  CareProviding: 'Care Providing',
  SeniorLeadership: 'Senior leadership',
  NonCareProviding: 'Non-care providing',
  Others: 'others',
};

const CWPRoleCategoryGroupValues = Object.values(CWPRoleCategoryGroup);

module.exports = {
  UserAccountStatus,
  MaxLoginAttempts,
  MaxFindUsernameAttempts,
  JobRoleId,
  CWPRoleCategoryGroup,
  CWPRoleCategoryGroupValues,
};
