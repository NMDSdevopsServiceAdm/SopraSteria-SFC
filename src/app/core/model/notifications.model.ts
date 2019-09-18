export interface Notification {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: NotificationType;
}

export enum NotificationType {
  OWNERCHANGE = 'Change data owner',
}
