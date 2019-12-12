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
import { RejectRequestDialogComponent } from '@shared/components/reject-request-dialog/reject-request-dialog.component';
import { Subscription } from 'rxjs';

const OWNERSHIP_APPROVED = 'OWNERCHANGEAPPROVED';

@Component({
  selector: 'app-notification-link-to-parent',
  templateUrl: './notification-link-to-parent.component.html',
  providers: [DialogService, Overlay],
})
export class NotificationLinkToParentComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public notification;
  private subscriptions: Subscription = new Subscription();
  public displayActionButtons;
  public notificationUid: string;
  public isWorkPlaceIsRequester: boolean;
  public ownerShipRequestedFrom: string;
  public ownerShipRequestedTo: string;
  public isSubWorkplace: boolean;
  public notificationRequestedFrom: string;
  public notificationRequestedTo: string;
  public requestorName: string;
  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private permissionsService: PermissionsService,
    private alertService: AlertService,
    private notificationsService: NotificationsService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.notificationUid = this.route.snapshot.params.notificationuid;
    this.notificationsService.getNotificationDetails(this.notificationUid).subscribe(details => {
      this.notification = details;
      this.notificationRequestedTo = details.typeContent.parentEstablishmentName;
      this.notificationRequestedFrom = details.typeContent.subEstablishmentName;
      if (details.typeContent.approvalStatus === 'REQUESTED' || details.typeContent.approvalStatus === 'CANCELLED') {
        this.requestorName = this.notificationRequestedFrom;
      } else {
        this.requestorName = this.notificationRequestedTo;
      }
      this.displayActionButtons =
        details.typeContent.approvalStatus === 'REQUESTED' || details.typeContent.approvalStatus === 'CANCELLED';
    });
    this.setNotificationViewed(this.notificationUid);
  }

  public approveRequest() {
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }
      //to Do
    }
  }
  protected setNotificationViewed(notificationUid) {
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

  public rejectRequest($event: Event) {
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }
      $event.preventDefault();
      const dialog = this.dialogService.open(RejectRequestDialogComponent, this.notification);
      dialog.afterClosed.subscribe(requestRejected => {
        if (requestRejected) {
          this.router.navigate(['/dashboard']);
          this.alertService.addAlert({
            type: 'success',
            message: `Your decision to transfer ownership of data has been sent to
                  ${this.notification.typeContent.requestorName} `,
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
