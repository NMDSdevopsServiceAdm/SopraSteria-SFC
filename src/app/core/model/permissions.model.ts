export interface PermissionsResponse {
  uid: string;
  permissions: {
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
  };
}
