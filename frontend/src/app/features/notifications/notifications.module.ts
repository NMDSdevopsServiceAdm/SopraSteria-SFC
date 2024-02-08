import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationBecomeAParentComponent } from '@features/notifications/notification-become-a-parent/notification-become-a-parent.component';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { SharedModule } from '@shared/shared.module';

import { NotificationCancelledComponent } from './notification-cancelled/notification-cancelled.component';
import { NotificationDeLinkToParentComponent } from './notification-delink-to-parent/notification-delink-to-parent.component';
import { NotificationLinkToParentComponent } from './notification-link-to-parent/notification-link-to-parent.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationOwnerChangeComponent } from './notification-owner-change/notification-owner-change.component';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationComponent,
    NotificationTypePipe,
    NotificationCancelledComponent,
    NotificationLinkToParentComponent,
    NotificationDeLinkToParentComponent,
    NotificationBecomeAParentComponent,
    NotificationOwnerChangeComponent,
  ],
  imports: [CommonModule, NotificationsRoutingModule, SharedModule, FormsModule, ReactiveFormsModule],
  exports: [NotificationTypePipe],
})
export class NotificationsModule {}
