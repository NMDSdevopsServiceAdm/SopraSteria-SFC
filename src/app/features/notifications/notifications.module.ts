import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';

import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationsRoutingModule } from './notifications-routing.module';

@NgModule({
  declarations: [NotificationListComponent, NotificationComponent, NotificationTypePipe],
  imports: [CommonModule, NotificationsRoutingModule, SharedModule],
  exports: [NotificationTypePipe]
})
export class NotificationsModule {}
