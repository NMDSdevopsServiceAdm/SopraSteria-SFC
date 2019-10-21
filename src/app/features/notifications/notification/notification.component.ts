import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Notification } from '@core/model/notifications.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  public workplace: Establishment;
  public notification: Notification;
  public status: 'pending' | 'approved' | 'rejected' = 'pending';
  protected subscriptions: Subscription = new Subscription();
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
    this.setNotificationViewed(notificationUid);
  }

  protected setNotificationViewed(notificationUid) {
    this.subscriptions.add(
      this.notificationsService.setNoticationViewed(notificationUid).subscribe(
        resp => {
          this.notificationsService.notifications.forEach((notification, i) => {
            if (notification.notificationUid === resp.notificationUid) {
              this.notificationsService.notifications[i] = resp;
            }
          });
          this.notificationsService.notifications$.next(this.notificationsService.notifications);
        },
        error => console.log('Could not update notification.')
      )
    );
  }

  public rejectRequest() {
    this.status = 'rejected';
  }
}
