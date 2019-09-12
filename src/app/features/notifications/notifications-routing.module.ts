import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationResolver } from '@core/resolvers/notification.resolver';

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
    resolve: {
      notification: NotificationResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
