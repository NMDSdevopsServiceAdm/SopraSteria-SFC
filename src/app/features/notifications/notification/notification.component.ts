import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Notification } from '@core/model/notifications.model';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  public workplace: Establishment;
  public notification: Notification;
  public status: 'pending' | 'approved' | 'rejected' = 'pending';
  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    const notificationUid = this.route.snapshot.params.notificationuid;
    this.notification = this.notificationsService.getNotification(notificationUid);
  }

  public approveRequest() {
    this.status = 'approved';
  }

  public rejectRequest() {
    this.status = 'rejected';
  }
}
