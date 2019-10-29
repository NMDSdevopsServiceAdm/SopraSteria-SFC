import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotificationCancelledComponent } from './notification-cancelled/notification-cancelled.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
