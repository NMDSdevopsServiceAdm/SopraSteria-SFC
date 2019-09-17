export interface NotificationSummary {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: NotificationType;
}

export interface Notification {
  uid: string;
  subject: string;
  date: string;
}

export enum NotificationType {
  OWNERCHANGE = 'Change data owner',
}
