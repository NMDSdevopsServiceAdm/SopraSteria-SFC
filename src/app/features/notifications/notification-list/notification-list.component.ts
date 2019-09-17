import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { NotificationSummary } from '@core/model/notifications.model';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit {
  workplace: Establishment;
  notifications: NotificationSummary[];
  constructor(
    private establishmentService: EstablishmentService,
    private notificationService: NotificationsService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notifications = this.notificationService.notifications;
  }
}
