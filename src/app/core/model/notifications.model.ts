export interface Notification {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: NotificationType;
  typeContent?: any;
}
export interface NotificationRequest {
  ownerRequestChangeUid: string;
  userUid?: string;
  approvalStatus: string;
  approvalReason: string;
}
export enum NotificationType {
  OWNERCHANGE = 'Change data owner',
}
