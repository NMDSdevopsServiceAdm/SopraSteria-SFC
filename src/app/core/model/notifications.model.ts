export interface Notification {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: NotificationType;
  typeContent: any;
}
export interface NotificationRequest {
  ownerRequestChangeUid: string;
  userUid?: string;
  approvalStatus: string;
  approvalReason: string;
}
export enum NotificationType {
  OWNERCHANGE = 'Change data owner',
  LINKTOPARENTREQUEST = 'Link to parent organisation',
  LINKTOPARENTAPPROVED = 'Link to parent organisation',
  LINKTOPARENTREJECTED = 'Link to parent organisation',
  DELINKTOPARENT = 'Remove link to parent organisation',
}
