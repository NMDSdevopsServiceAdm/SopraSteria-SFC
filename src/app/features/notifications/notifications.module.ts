import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
  declarations: [NotificationListComponent, NotificationComponent],
  imports: [CommonModule, NotificationsRoutingModule],
})
export class NotificationsModule {}
