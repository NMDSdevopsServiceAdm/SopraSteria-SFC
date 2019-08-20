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
  | 'canMoveWorker'
  | 'canOrderEstablishment'
  | 'canOrderWorker'
  | 'canViewEstablishment'
  | 'canViewKeyFacts'
  | 'canViewLastUpdatedTime'
  | 'canViewNotifications'
  | 'canViewWdfReport'
  | 'canViewWorker'
  | 'canViewWorkerStatus';
