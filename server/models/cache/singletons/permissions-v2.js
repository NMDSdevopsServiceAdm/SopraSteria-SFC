const uniq = require('lodash/uniq');

const readPermissions = () => [
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  'canDownloadWdfReport',
  'canViewBenchmarks',
  'canViewNinoDob',
];

const editPermissions = (estabType = 'Standalone') => {
  const permissions = [
    ...readPermissions(),
    'canAddUser',
    'canBulkUpload',
    'canChangePermissionsForSubsidiary',
    'canChangeDataOwner',
    'canDeleteUser',
    'canEditUser',
    'canViewListOfWorkers',
    'canViewWorker',
    'canAddWorker',
    'canEditWorker',
    'canDeleteWorker',
    'canTransferWorker',
    'canEditEstablishment',
    'canRunLocalAuthorityReport',
    'canLinkToParent',
    'canBecomeAParent',
  ];

  if (estabType === 'Parent') permissions.push('canAddEstablishment');
  if (estabType === 'Subsidiary') {
    permissions.push('canRemoveParentAssociation');
    permissions.push('canDeleteEstablishment');
  }

  return permissions;
};

const adminPermissions = (estabType = 'Standalone') =>
  uniq([
    ...editPermissions(estabType),
    'canDeleteEstablishment',
    'canDeleteAllEstablishments',
    'canRunLocalAuthorityAdminReport',
    'canViewWdfSummaryReport',
    'canSearchUsers',
    'canSearchEstablishment',
  ]);

const dataPermissionNone = () => ['canRemoveParentAssociation', 'canViewBenchmarks'];

const dataPermissionWorkplace = () => [
  ...dataPermissionNone(),
  'canChangePermissionsForSubsidiary',
  'canChangeDataOwner',
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
];

const dataPermissionWorkplaceAndStaff = () => [...dataPermissionWorkplace(), 'canViewListOfWorkers', 'canViewWorker'];

const getPermissions = (req) => {
  const estabType = getEstablishmentType(req.establishment);

  if (req.role === 'Admin') return adminPermissions(estabType);

  if (ownsData(estabType, req)) return req.role === 'Edit' ? editPermissions(estabType) : readPermissions();

  return getViewingPermissions(req.dataPermissions);
};

const getEstablishmentType = (establishment) => {
  if (establishment.isSubsidiary) {
    return 'Subsidiary';
  } else if (establishment.isParent) {
    return 'Parent';
  }
  return 'Standalone';
};

const ownsData = (estabType, req) =>
  estabType === 'Standalone' ||
  _isSubWhichOwnsData(estabType, req) ||
  _isParentWhichOwnsSubData(estabType, req) ||
  _isParentViewingOwnData(estabType, req);

const _isSubWhichOwnsData = (estabType, req) => estabType === 'Subsidiary' && !req.parentIsOwner && !req.isParent;

const _isParentWhichOwnsSubData = (estabType, req) => estabType === 'Subsidiary' && req.parentIsOwner && req.isParent;

const _isParentViewingOwnData = (estabType, req) => estabType === 'Parent' && req.isParent;

const getViewingPermissions = (dataPermissions = 'None') => {
  if (dataPermissions === 'Workplace') {
    return dataPermissionWorkplace();
  } else if (dataPermissions === 'Workplace and Staff') {
    return dataPermissionWorkplaceAndStaff();
  }
  return dataPermissionNone();
};

module.exports = {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
};
