export interface PermissionsResponse {
  uid: string;
  permissions: PermissionsList;
}

export interface PermissionsList {
  [key: string]: boolean;
}

export interface Permissions {
  [key: string]: PermissionsList;
}

export type PermissionType =
  | 'canAddEstablishment'
  | 'canAddUser'
  | 'canAddWorker'
  | 'canBulkUpload'
  | 'canChangePermissionsForSubsidiary'
  | 'canDeleteEstablishment'
  | 'canDeleteUser'
  | 'canDeleteWorker'
  | 'canEditUser'
  | 'canEditWorker'
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
  | 'canViewWorker';
