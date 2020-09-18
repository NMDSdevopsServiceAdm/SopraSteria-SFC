import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Notification } from '@core/model/notifications.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit {
  workplace: Establishment;
  notifications: Notification[];
  public ownerChangeRequestUID;
  constructor(
    private establishmentService: EstablishmentService,
    private notificationService: NotificationsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notifications = orderBy(this.notificationService.notifications, (notification) => notification.created, [
      'desc',
    ]);
  }
}
