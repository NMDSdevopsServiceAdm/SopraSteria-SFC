const uniq = require('lodash/uniq');
const models = require('../../models');

const getPermissions = async (req) => {
  const rawEstablishmentInfo = await models.establishment.getInfoForPermissions(req.establishmentId);
  const rawUserInfo = await models.user.getCanManageWdfClaims(req.userUid);
  const establishmentAndUserInfo = convertEstablishmentAndUserInfo(rawEstablishmentInfo, rawUserInfo);

  const estabType = getEstablishmentType(req.establishment);

  if (req.role === 'Admin') return adminPermissions(estabType, establishmentAndUserInfo, req.isParent);
  if (req.role === 'AdminManager') return adminManagerPermissions(estabType, establishmentAndUserInfo, req.isParent);

  if (ownsData(estabType, req)) {
    return getDataOwnerPermissions(req, estabType, establishmentAndUserInfo);
  }

  return getViewingPermissions(req.dataPermissions, establishmentAndUserInfo);
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

const getDataOwnerPermissions = (req, estabType, establishmentAndUserInfo) => {
  if (req.role === 'Edit') return editPermissions(estabType, establishmentAndUserInfo, req.isParent);
  if (req.role === 'Read') return readPermissions(establishmentAndUserInfo);

  return nonePermissions(establishmentAndUserInfo);
};

const getViewingPermissions = (dataPermissions = 'None', establishmentAndUserInfo) => {
  if (dataPermissions === 'Workplace') return dataPermissionWorkplace(establishmentAndUserInfo);
  if (dataPermissions === 'Workplace and Staff') return dataPermissionWorkplaceAndStaff(establishmentAndUserInfo);

  return dataPermissionNone(establishmentAndUserInfo);
};

const nonePermissions = (establishmentAndUserInfo) =>
  [_canManageWdfClaims(establishmentAndUserInfo)].filter((item) => item !== undefined);

const readPermissions = (establishmentAndUserInfo) => [
  ...nonePermissions(establishmentAndUserInfo),
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  'canDownloadWdfReport',
  'canViewNinoDob',
];

const editPermissions = (estabType = 'Standalone', establishmentAndUserInfo, isLoggedInAsParent) => [
  ...readPermissions(establishmentAndUserInfo),
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
  ...getAdditionalEditPermissions(estabType, establishmentAndUserInfo, isLoggedInAsParent),
];

const adminPermissions = (estabType = 'Standalone', establishmentAndUserInfo, isLoggedInAsParent) => {
  const adminCant = ['canViewNinoDob'];

  return adminManagerPermissions(estabType, establishmentAndUserInfo, isLoggedInAsParent).filter(
    (permission) => !adminCant.includes(permission),
  );
};

const adminManagerPermissions = (estabType = 'Standalone', establishmentAndUserInfo, isLoggedInAsParent) => {
  return uniq([
    ...editPermissions(estabType, establishmentAndUserInfo, isLoggedInAsParent),
    'canDeleteEstablishment',
    'canDeleteAllEstablishments',
    'canRunLocalAuthorityAdminReport',
    'canDownloadWdfReport',
    'canViewWdfSummaryReport',
    'canSearchUsers',
    'canSearchEstablishment',
    'canViewLastBulkUpload',
  ]);
};

const dataPermissionNone = (establishmentAndUserInfo) => ['canRemoveParentAssociation'];

const dataPermissionWorkplace = (establishmentAndUserInfo) => [
  ...dataPermissionNone(establishmentAndUserInfo),
  'canChangePermissionsForSubsidiary',
  'canViewEstablishment',
  'canViewWdfReport',
  'canViewUser',
  'canViewListOfUsers',
  ...getAdditionalDataPermissionWorkplacePermissions(establishmentAndUserInfo),
];

const dataPermissionWorkplaceAndStaff = (establishmentAndUserInfo) => [
  ...dataPermissionWorkplace(establishmentAndUserInfo),
  'canViewListOfWorkers',
  'canViewWorker',
];

const getAdditionalEditPermissions = (estabType, establishmentAndUserInfo, isLoggedInAsParent) => {
  const additionalPermissions = [
    _canAddEstablishment(estabType),
    _canDeleteEstablishment(estabType),
    _canLinkToParent(isLoggedInAsParent, establishmentAndUserInfo),
    _canRemoveParentAssociation(isLoggedInAsParent, establishmentAndUserInfo),
    _canDownloadWdfReport(isLoggedInAsParent),
    _canBecomeAParent(isLoggedInAsParent, establishmentAndUserInfo),
    _canChangeDataOwner(establishmentAndUserInfo),
  ];

  return additionalPermissions.filter((item) => item !== undefined);
};

const getAdditionalDataPermissionWorkplacePermissions = (establishmentAndUserInfo) => {
  const additionalPermissions = [_canChangeDataOwner(establishmentAndUserInfo)];

  return additionalPermissions.filter((item) => item !== undefined);
};

const _isSubWhichOwnsData = (estabType, req) => estabType === 'Subsidiary' && !req.parentIsOwner && !req.isParent;

const _isParentWhichOwnsSubData = (estabType, req) => estabType === 'Subsidiary' && req.parentIsOwner && req.isParent;

const _isParentViewingOwnData = (estabType, req) => estabType === 'Parent' && req.isParent;

const _isStandaloneAndNoRequestToBecomeParent = (isLoggedInAsParent, establishmentAndUserInfo) =>
  !isLoggedInAsParent && !establishmentAndUserInfo.hasParent && !establishmentAndUserInfo.hasRequestedToBecomeAParent;

const _canAddEstablishment = (estabType) => (estabType === 'Parent' ? 'canAddEstablishment' : undefined);

const _canDeleteEstablishment = (estabType) => (estabType === 'Subsidiary' ? 'canDeleteEstablishment' : undefined);

const _canLinkToParent = (isLoggedInAsParent, establishmentAndUserInfo) =>
  _isStandaloneAndNoRequestToBecomeParent(isLoggedInAsParent, establishmentAndUserInfo) ? 'canLinkToParent' : undefined;

const _canRemoveParentAssociation = (isLoggedInAsParent, establishmentAndUserInfo) =>
  !isLoggedInAsParent && establishmentAndUserInfo.hasParent ? 'canRemoveParentAssociation' : undefined;

const _canDownloadWdfReport = (isLoggedInAsParent) => (isLoggedInAsParent ? 'canDownloadWdfReport' : undefined);

const _canBecomeAParent = (isLoggedInAsParent, establishmentAndUserInfo) =>
  !isLoggedInAsParent && !establishmentAndUserInfo.hasParent ? 'canBecomeAParent' : undefined;

const _canChangeDataOwner = (establishmentAndUserInfo) =>
  !establishmentAndUserInfo.dataOwnershipRequested ? 'canChangeDataOwner' : undefined;

const _canManageWdfClaims = (establishmentAndUserInfo) =>
  establishmentAndUserInfo.canManageWdfClaims ? 'canManageWdfClaims' : undefined;

const convertEstablishmentAndUserInfo = (rawEstablishmentInfo, rawUserInfo) => {
  return {
    hasParent: rawEstablishmentInfo.get('hasParent'),
    mainServiceId: rawEstablishmentInfo.mainService.id,
    hasRequestedToBecomeAParent: rawEstablishmentInfo.get('hasRequestedToBecomeAParent'),
    isRegulated: rawEstablishmentInfo.get('IsRegulated'),
    dataOwnershipRequested: rawEstablishmentInfo.dataOwnershipRequested,
    canManageWdfClaims: rawUserInfo.CanManageWdfClaimsValue,
  };
};

module.exports = {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
};
