import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Notification } from '@core/model/notifications.model';
import { NotificationsService } from '@core/notifications/notifications.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public notification: Notification;
  public status: 'pending' | 'approved' | 'rejected' = 'pending';
  constructor(
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notification = this.notificationsService.activeNotification;
  }

  ngOnDestroy() {
    this.notificationsService.activeNotification = null;
  }

  public approveRequest() {
    this.status = 'approved';
  }

  public rejectRequest() {
    this.status = 'rejected';
  }
}
