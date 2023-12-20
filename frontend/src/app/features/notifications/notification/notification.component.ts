import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subject, Subscription } from 'rxjs';

const OWNERSHIP_APPROVED = 'OWNERCHANGEAPPROVED';
const OWNERSHIP_REJECTED = 'OWNERCHANGEREJECTED';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public notification;
  private subscriptions: Subscription = new Subscription();
  public displayActionButtons;
  public notificationUid: string;
  public isWorkPlaceIsRequester: boolean;
  public ownerShipRequestedFrom: string;
  public ownerShipRequestedTo: string;
  public isSubWorkplace: boolean;

  eventsSubject: Subject<string> = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notificationUid = this.route.snapshot.params.notificationuid;

    this.notificationsService.getNotificationDetails(this.notificationUid).subscribe((details) => {
      this.notification = details;
      this.isSubWorkplace =
        this.workplace.isParent && this.workplace.uid === this.establishmentService.primaryWorkplace.uid ? true : false;

      this.displayActionButtons =
        details.typeContent.approvalStatus === 'REQUESTED' || details.typeContent.approvalStatus === 'CANCELLED';
    });
    this.setNotificationViewed(this.notificationUid);
  }

  public approveRequest() {
    this.eventsSubject.next('APPROVE');
  }

  public rejectRequest($event: Event) {
    $event.preventDefault();
    this.eventsSubject.next('REJECT');
  }

  private setNotificationViewed(notificationUid) {
    this.subscriptions.add(
      this.notificationsService.setNotificationViewed(notificationUid).subscribe((resp) => {
        if (resp) {
          this.notificationsService.notifications.forEach((notification, i) => {
            if (notification.notificationUid === resp.notification.notificationUid) {
              this.notificationsService.notifications[i] = resp.notification;
            }
          });
          this.notificationsService.notifications$.next(this.notificationsService.notifications);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
