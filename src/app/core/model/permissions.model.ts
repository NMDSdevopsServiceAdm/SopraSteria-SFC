export interface PermissionsResponse {
  uid: string;
  permissions: PermissionType[];
}

export interface Permissions {
  [key: string]: PermissionType[];
}

export type PermissionType =
  | 'canAddEstablishment'
  | 'canAddUser'
  | 'canAddWorker'
  | 'canBulkUpload'
  | 'canChangePermissionsForSubsidiary'
  | 'canDeleteEstablishment'
  | 'canDeleteAllEstablishments'
  | 'canDeleteUser'
  | 'canDeleteWorker'
  | 'canEditEstablishment'
  | 'canEditUser'
  | 'canEditWorker'
  | 'canRunLocalAuthorityReport'
  | 'canSortEstablishments'
  | 'canSortWorkers'
  | 'canTransferWorker'
  | 'canViewEstablishment'
  | 'canViewLastUpdateTime'
  | 'canViewListOfUsers'
  | 'canViewListOfWorkers'
  | 'canViewNotifications'
  | 'canViewVisuals'
  | 'canViewUser'
  | 'canViewWdfReport'
  | 'canViewWorker'
  | 'canLinkToParent'
  | 'canBecomeAParent'
  | 'canRemoveParentAssociation'
  | 'canDownloadWdfReport'
  | 'canViewBenchmarks'
  | 'canViewNinoDob';
