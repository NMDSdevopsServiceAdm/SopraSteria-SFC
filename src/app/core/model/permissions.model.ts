export interface PermissionsResponse {
  uid: string;
  permissions: Permissions;
}

export interface Permissions {
  canAddEstablishment?: boolean;
  canAddUser?: boolean;
  canAddWorker?: boolean;
  canBulkUpload?: boolean;
  canChangePermissionsForSubsidiary?: boolean;
  canDeleteEstablishment?: boolean;
  canDeleteUser?: boolean;
  canDeleteWorker?: boolean;
  canEditUser?: boolean;
  canEditWorker?: boolean;
  canMoveWorker?: boolean;
  canOrderEstablishment?: boolean;
  canOrderWorker?: boolean;
  canViewEstablishment?: boolean;
  canViewKeyFacts?: boolean;
  canViewLastUpdatedTime?: boolean;
  canViewNotifications?: boolean;
  canViewWdfReport?: boolean;
  canViewWorker?: boolean;
  canViewWorkerStatus?: boolean;
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
