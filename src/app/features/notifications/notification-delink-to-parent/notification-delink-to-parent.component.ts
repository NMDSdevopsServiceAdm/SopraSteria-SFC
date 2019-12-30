import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-delink-to-parent',
  templateUrl: './notification-delink-to-parent.component.html',
  providers: [DialogService, Overlay],
})
export class NotificationDeLinkToParentComponent implements OnInit, OnDestroy {
  public notification;
  private subscriptions: Subscription = new Subscription();
  public notificationUid: string;
  public notificationRequestedFrom: string;
  public notificationRequestedTo: string;
  public requestorName: string;
  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.notificationUid = this.route.snapshot.params.notificationuid;
    this.subscriptions.add(
      this.notificationsService.getNotificationDetails(this.notificationUid).subscribe(details => {
        this.notification = details;
        this.notificationRequestedTo = details.typeContent.parentEstablishmentName;
        this.notificationRequestedFrom = details.typeContent.requestorName;
        this.requestorName = details.typeContent.requestorName;
      })
    );
    this.setNotificationViewed(this.notificationUid);
  }

  /**
   * Function used to set nothification as read
   * @param {string} notification uid
   * @return {void}
   */
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
