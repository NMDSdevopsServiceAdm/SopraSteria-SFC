const uniq = require('lodash/uniq');
const models = require('../../../models');

const readPermissions = (establishmentInfo) => [
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  'canDownloadWdfReport',
  'canViewBenchmarks',
  'canViewNinoDob',
];

const editPermissions = (estabType = 'Standalone', establishmentInfo, isLoggedInAsParent) => {
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
  ];

  const additionalPermissions = getAdditionalEditPermissions(estabType, establishmentInfo, isLoggedInAsParent);

  permissions.push(...additionalPermissions);

  return permissions;
};

const adminPermissions = (estabType = 'Standalone', establishmentInfo, isLoggedInAsParent) =>
  uniq([
    ...editPermissions(estabType, establishmentInfo, isLoggedInAsParent),
    'canDeleteEstablishment',
    'canDeleteAllEstablishments',
    'canRunLocalAuthorityAdminReport',
    'canDownloadWdfReport',
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

const getPermissions = async (req) => {
  const establishmentInfo = await models.establishment.getInfoForPermissions(req.establishmentId);

  const estabType = getEstablishmentType(req.establishment);

  if (req.role === 'Admin') return adminPermissions(estabType, establishmentInfo, req.isParent);

  if (ownsData(estabType, req))
    return req.role === 'Edit'
      ? editPermissions(estabType, establishmentInfo, req.isParent)
      : readPermissions(establishmentInfo);

  return getViewingPermissions(req.dataPermissions, establishmentInfo);
};

const getAdditionalEditPermissions = (estabType, establishmentInfo, isLoggedInAsParent) => {
  const additionalPermissions = [
    _canAddEstablishment(estabType),
    _canDeleteEstablishment(estabType),
    _canLinkToParent(isLoggedInAsParent, establishmentInfo),
    _canRemoveParentAssociation(isLoggedInAsParent, establishmentInfo),
    _canDownloadWdfReport(isLoggedInAsParent),
    _canBecomeAParent(isLoggedInAsParent, establishmentInfo),
  ];

  return additionalPermissions.filter((item) => item !== undefined);
};

const _isStandaloneAndNoRequestToBecomeParent = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && !establishmentInfo.hasParent && !establishmentInfo.hasRequestedToBecomeAParent;

const _canAddEstablishment = (estabType) => (estabType === 'Parent' ? 'canAddEstablishment' : undefined);
const _canDeleteEstablishment = (estabType) => (estabType === 'Subsidiary' ? 'canDeleteEstablishment' : undefined);
const _canLinkToParent = (isLoggedInAsParent, establishmentInfo) =>
  _isStandaloneAndNoRequestToBecomeParent(isLoggedInAsParent, establishmentInfo) ? 'canLinkToParent' : undefined;
const _canRemoveParentAssociation = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && establishmentInfo.hasParent ? 'canRemoveParentAssociation' : undefined;
const _canDownloadWdfReport = (isLoggedInAsParent) => (isLoggedInAsParent ? 'canDownloadWdfReport' : undefined);
const _canBecomeAParent = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && !establishmentInfo.hasParent ? 'canBecomeAParent' : undefined;

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
