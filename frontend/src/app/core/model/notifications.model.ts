export interface Notification {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: string;
  typeContent: any;
}

export interface NotificationListResponse {
  notifications: Notification[];
  count: number;
}

export interface NotificationRequest {
  ownerRequestChangeUid: string;
  userUid?: string;
  approvalStatus: string;
  approvalReason: string;
}

export interface NotificationData {
  establishmentNotification: boolean;
  notification: Notification;
}

export interface NotificationTypes {
  uid: string;
  type: string;
  title: string;
}

export enum NotificationType {
  OWNERCHANGE = 'Change data owner',
  LINKTOPARENTREQUEST = 'Link to parent organisation',
  LINKTOPARENTAPPROVED = 'Link to parent organisation',
  LINKTOPARENTREJECTED = 'Link to parent organisation',
  DELINKTOPARENT = 'Remove link to parent organisation',
  BECOMEAPARENT = 'Become a parent organisation',
}
