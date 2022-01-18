const uniq = require('lodash/uniq');
const models = require('../../../models');

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

  const additionalPermissions = getAdditionalEditPermissions(estabType);

  permissions.push(...additionalPermissions);

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

const getAdditionalEditPermissions = (estabType) => {
  const additionalPermissions = [
    _canAddEstablishment(estabType),
    _canRemoveParentAssociation(estabType),
    _canDeleteEstablishment(estabType),
  ];

  return additionalPermissions.filter((item) => item !== undefined);
};

const _canAddEstablishment = (estabType) => (estabType === 'Parent' ? 'canAddEstablishment' : undefined);
const _canRemoveParentAssociation = (estabType) =>
  estabType === 'Subsidiary' ? 'canRemoveParentAssociation' : undefined;
const _canDeleteEstablishment = (estabType) => (estabType === 'Subsidiary' ? 'canDeleteEstablishment' : undefined);

const getPermissions = async (req) => {
  const establishmentInfo = await models.establishment.getInfoForPermissions(req.establishmentId);

  const estabType = getEstablishmentType(req.establishment);

  if (req.role === 'Admin') return adminPermissions(estabType, establishmentInfo);

  if (ownsData(estabType, req))
    return req.role === 'Edit' ? editPermissions(estabType, establishmentInfo) : readPermissions(establishmentInfo);

  return getViewingPermissions(req.dataPermissions, establishmentInfo);
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
