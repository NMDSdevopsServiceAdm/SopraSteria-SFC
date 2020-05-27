import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import { ParentRequestsService } from '@core/services/parent-requests.service';

@Component({
  selector: 'app-notification-become-a-parent',
  templateUrl: './notification-become-a-parent.component.html',
  providers: [Overlay],
})
export class NotificationBecomeAParentComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public notification;
  private subscriptions: Subscription = new Subscription();
  public notificationUid: string;
  public status: string;

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService,
    private parentRequestsService: ParentRequestsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notificationUid = this.route.snapshot.params.notificationuid;
    this.subscriptions.add(
      this.notificationsService.getNotificationDetails(this.notificationUid).subscribe(details => {
        this.notification = details;
        this.parentRequestsService.getParentRequest(this.notification.typUid, this.establishmentService.establishmentId).subscribe(request => {
          this.status = request.status;
        });
      })
    );
    this.setNotificationViewed(this.notificationUid);
  }

  private setNotificationViewed(notificationUid) {
    this.subscriptions.add(
      this.notificationsService.setNoticationViewed(notificationUid).subscribe(
        resp => {
          if (resp) {
            this.notificationsService.notifications.forEach((notification, i) => {
              if (notification.notificationUid === resp.notificationUid) {
                this.notificationsService.notifications[i] = resp;
              }
            });
            this.notificationsService.notifications$.next(this.notificationsService.notifications);
          }
        },
        error => console.log('Could not update notification.')
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
