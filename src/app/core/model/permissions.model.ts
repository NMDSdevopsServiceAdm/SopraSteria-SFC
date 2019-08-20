export interface PermissionsResponse {
  uid: string;
  permissions: Permissions;
}

export interface Permissions {
  [key: string]: boolean;
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
