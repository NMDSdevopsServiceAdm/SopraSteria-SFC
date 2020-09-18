import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotificationCancelledComponent } from './notification-cancelled/notification-cancelled.component';
import { NotificationDeLinkToParentComponent } from './notification-delink-to-parent/notification-delink-to-parent.component';
import { NotificationLinkToParentComponent } from './notification-link-to-parent/notification-link-to-parent.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationBecomeAParentComponent } from '@features/notifications/notification-become-a-parent/notification-become-a-parent.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationListComponent,
  },
  {
    path: ':notificationuid',
    component: NotificationComponent,
  },
  {
    path: 'notification-cancelled/:notificationuid',
    component: NotificationCancelledComponent,
  },
  {
    path: 'notification-link-to-parent/:notificationuid',
    component: NotificationLinkToParentComponent,
  },
  {
    path: 'notification-delink-to-parent/:notificationuid',
    component: NotificationDeLinkToParentComponent,
  },
  {
    path: 'notification-become-a-parent/:notificationuid',
    component: NotificationBecomeAParentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
