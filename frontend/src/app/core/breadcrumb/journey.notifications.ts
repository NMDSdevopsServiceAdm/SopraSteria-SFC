import { JourneyRoute } from './breadcrumb.model';

enum Path {
  ALL_NOTIFICATIONS = '/notifications',
  NOTIFICATION = '/notifications/:notificationUid',
}

export const notificationsJourney: JourneyRoute = {
  children: [
    {
      title: 'Notifications',
      path: Path.ALL_NOTIFICATIONS,
      children: [
        {
          title: 'Notification',
          path: Path.NOTIFICATION,
        },
      ],
    },
  ],
};
