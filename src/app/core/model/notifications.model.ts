export interface NotificationSummary {
  uid: string;
  read: boolean;
  subject: string;
  date: string;
}

export interface Notification {
  uid: string;
  subject: string;
  date: string;
}
