const uniq = require('lodash/uniq');
const models = require('../../models');

const getPermissions = async (req) => {
  const rawEstablishmentInfo = await models.establishment.getInfoForPermissions(req.establishmentId);
  const establishmentInfo = convertEstablishmentInfo(rawEstablishmentInfo);

  const estabType = getEstablishmentType(req.establishment);

  if (req.role === 'Admin') return adminPermissions(estabType, establishmentInfo, req.isParent);

  if (ownsData(estabType, req))
    return req.role === 'Edit'
      ? editPermissions(estabType, establishmentInfo, req.isParent)
      : readPermissions(establishmentInfo);

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

const getViewingPermissions = (dataPermissions = 'None', establishmentInfo) => {
  if (dataPermissions === 'Workplace') {
    return dataPermissionWorkplace(establishmentInfo);
  } else if (dataPermissions === 'Workplace and Staff') {
    return dataPermissionWorkplaceAndStaff(establishmentInfo);
  }
  return dataPermissionNone(establishmentInfo);
};

const readPermissions = (establishmentInfo) => [
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  'canDownloadWdfReport',
  'canViewNinoDob',
  ...getAdditionalReadPermissions(establishmentInfo),
];

const editPermissions = (estabType = 'Standalone', establishmentInfo, isLoggedInAsParent) => [
  ...readPermissions(establishmentInfo),
  'canAddUser',
  'canBulkUpload',
  'canChangePermissionsForSubsidiary',
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
  ...getAdditionalEditPermissions(estabType, establishmentInfo, isLoggedInAsParent),
];

const adminPermissions = (estabType = 'Standalone', establishmentInfo, isLoggedInAsParent) => {
  const adminCant = ['canViewNinoDob'];

  return uniq([
    ...editPermissions(estabType, establishmentInfo, isLoggedInAsParent),
    'canDeleteEstablishment',
    'canDeleteAllEstablishments',
    'canRunLocalAuthorityAdminReport',
    'canDownloadWdfReport',
    'canViewWdfSummaryReport',
    'canSearchUsers',
    'canSearchEstablishment',
  ]).filter((permission) => !adminCant.includes(permission));
};

const dataPermissionNone = (establishmentInfo) => [
  'canRemoveParentAssociation',
  ...getAdditionalDataPermissionNonePermissions(establishmentInfo),
];

const dataPermissionWorkplace = (establishmentInfo) => [
  ...dataPermissionNone(establishmentInfo),
  'canChangePermissionsForSubsidiary',
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  ...getAdditionalDataPermissionWorkplacePermissions(establishmentInfo),
];

const dataPermissionWorkplaceAndStaff = (establishmentInfo) => [
  ...dataPermissionWorkplace(establishmentInfo),
  'canViewListOfWorkers',
  'canViewWorker',
];

const getAdditionalEditPermissions = (estabType, establishmentInfo, isLoggedInAsParent) => {
  const additionalPermissions = [
    _canAddEstablishment(estabType),
    _canDeleteEstablishment(estabType),
    _canLinkToParent(isLoggedInAsParent, establishmentInfo),
    _canRemoveParentAssociation(isLoggedInAsParent, establishmentInfo),
    _canDownloadWdfReport(isLoggedInAsParent),
    _canBecomeAParent(isLoggedInAsParent, establishmentInfo),
    _canChangeDataOwner(establishmentInfo),
  ];

  return additionalPermissions.filter((item) => item !== undefined);
};

const getAdditionalReadPermissions = (establishmentInfo) => {
  const additionalPermissions = [_canViewBenchmarks(establishmentInfo)];

  return additionalPermissions.filter((item) => item !== undefined);
};

const getAdditionalDataPermissionNonePermissions = (establishmentInfo) => {
  const additionalPermissions = [_canViewBenchmarks(establishmentInfo)];

  return additionalPermissions.filter((item) => item !== undefined);
};

const getAdditionalDataPermissionWorkplacePermissions = (establishmentInfo) => {
  const additionalPermissions = [_canChangeDataOwner(establishmentInfo)];

  return additionalPermissions.filter((item) => item !== undefined);
};

const _isSubWhichOwnsData = (estabType, req) => estabType === 'Subsidiary' && !req.parentIsOwner && !req.isParent;

const _isParentWhichOwnsSubData = (estabType, req) => estabType === 'Subsidiary' && req.parentIsOwner && req.isParent;

const _isParentViewingOwnData = (estabType, req) => estabType === 'Parent' && req.isParent;

const _isStandaloneAndNoRequestToBecomeParent = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && !establishmentInfo.hasParent && !establishmentInfo.hasRequestedToBecomeAParent;

const _isRegulatedAndHasServiceWithBenchmarksData = (establishmentInfo) =>
  [24, 25, 20].includes(establishmentInfo.mainServiceId) && establishmentInfo.isRegulated;

const _canAddEstablishment = (estabType) => (estabType === 'Parent' ? 'canAddEstablishment' : undefined);

const _canDeleteEstablishment = (estabType) => (estabType === 'Subsidiary' ? 'canDeleteEstablishment' : undefined);

const _canLinkToParent = (isLoggedInAsParent, establishmentInfo) =>
  _isStandaloneAndNoRequestToBecomeParent(isLoggedInAsParent, establishmentInfo) ? 'canLinkToParent' : undefined;

const _canRemoveParentAssociation = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && establishmentInfo.hasParent ? 'canRemoveParentAssociation' : undefined;

const _canDownloadWdfReport = (isLoggedInAsParent) => (isLoggedInAsParent ? 'canDownloadWdfReport' : undefined);

const _canBecomeAParent = (isLoggedInAsParent, establishmentInfo) =>
  !isLoggedInAsParent && !establishmentInfo.hasParent ? 'canBecomeAParent' : undefined;

const _canViewBenchmarks = (establishmentInfo) =>
  _isRegulatedAndHasServiceWithBenchmarksData(establishmentInfo) ? 'canViewBenchmarks' : undefined;

const _canChangeDataOwner = (establishmentInfo) =>
  !establishmentInfo.dataOwnershipRequested ? 'canChangeDataOwner' : undefined;

const convertEstablishmentInfo = (rawEstablishmentInfo) => {
  return {
    hasParent: rawEstablishmentInfo.get('hasParent'),
    mainServiceId: rawEstablishmentInfo.mainService.id,
    hasRequestedToBecomeAParent: rawEstablishmentInfo.get('hasRequestedToBecomeAParent'),
    isRegulated: rawEstablishmentInfo.get('IsRegulated'),
    dataOwnershipRequested: rawEstablishmentInfo.dataOwnershipRequested,
  };
};

module.exports = {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
};
