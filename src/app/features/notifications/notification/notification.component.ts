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
const OWNERSHIP_REJECTED = 'OWNERCHANGEREJECTED';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  providers: [DialogService, Overlay],
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

      this.isSubWorkplace =
        this.workplace.isParent && this.workplace.uid === this.establishmentService.primaryWorkplace.uid ? true : false;

      this.ownerShipRequestedFrom =
        details.typeContent.requestedOwnerType === 'Workplace'
          ? details.typeContent.parentEstablishmentName
          : details.typeContent.subEstablishmentName;
      this.ownerShipRequestedTo =
        details.typeContent.requestedOwnerType === 'Workplace'
          ? details.typeContent.subEstablishmentName
          : details.typeContent.parentEstablishmentName;

      if (details.typeContent.approvalStatus === 'APPROVED') {
        this.isWorkPlaceIsRequester = this.workplace.name !== this.ownerShipRequestedFrom;
      } else {
        this.isWorkPlaceIsRequester = this.workplace.name === this.ownerShipRequestedFrom;
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

      let requestParameter = {
        ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
        approvalStatus: 'APPROVED',
        approvalReason: '',
        rejectionReason: null,
        type: OWNERSHIP_APPROVED,
        exsistingNotificationUid: this.notificationUid,
        requestedOwnership: this.notification.typeContent.permissionRequest,
      };
      this.subscriptions.add(
        this.notificationsService
          .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
          .subscribe(
            request => {
              if (request) {
                this.establishmentService.getEstablishment(this.workplace.uid).subscribe(workplace => {
                  if (workplace) {
                    this.permissionsService.getPermissions(this.workplace.uid).subscribe(hasPermission => {
                      if (hasPermission) {
                        this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
                        this.establishmentService.setState(workplace);
                        this.establishmentService.setPrimaryWorkplace(workplace);
                        this.router.navigate(['/dashboard']);
                        this.alertService.addAlert({
                          type: 'success',
                          message: `Your decision to transfer ownership of data has been sent to
                      ${this.notification.typeContent.requestorName} `,
                        });
                      }
                    });
                  }
                });
                this.notificationsService.getAllNotifications().subscribe(notify => {
                  this.notificationsService.notifications$.next(notify);
                });
              }
            },
            error => {
              console.error(error.error.message);
            }
          )
      );
    }
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
          this.rejectPermissionRequest(requestRejected);
        }
      });
    }
  }

  private rejectPermissionRequest(requestRejected) {
    let requestParameter = {
      ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
      approvalStatus: 'DENIED',
      rejectionReason: requestRejected.rejectionReason,
      type: OWNERSHIP_REJECTED,
      exsistingNotificationUid: this.notification.notificationUid,
    };
    this.subscriptions.add(
      this.notificationsService
        .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
        .subscribe(
          request => {
            if (request) {
              this.notificationsService.getAllNotifications().subscribe(notify => {
                this.notificationsService.notifications$.next(notify);
              });
              this.router.navigate(['/dashboard']);
              this.alertService.addAlert({
                type: 'success',
                message: `Your decision to transfer ownership of data has been sent to
                  ${this.notification.typeContent.requestorName} `,
              });
            }
          },
          error => {
            console.log('Could not update notification.');
          }
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
