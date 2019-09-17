export interface NotificationSummary {
  created: string;
  isViewed: boolean;
  notificationUid: string;
  type: string;
}

export interface Notification {
  uid: string;
  subject: string;
  date: string;
}
