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
  public isWorkPlaceRequester: boolean;
  public ownerShipRequestedFrom: string;
  public ownerShipRequestedTo: string;
  public isSubWorkplace: boolean;
  public notificationRequestedFrom: string;
  public notificationRequestedTo: string;
  public requestorName: string;
  public postCode: string;
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
    this.subscriptions.add(
      this.notificationsService.getNotificationDetails(this.notificationUid).subscribe(details => {
        this.notification = details;
        this.notificationRequestedTo = details.typeContent.parentEstablishmentName;
        this.notificationRequestedFrom = details.typeContent.subEstablishmentName;
        this.requestorName = details.typeContent.requestorName;
        this.postCode = details.typeContent.postCode;
        this.isWorkPlaceRequester = this.workplace.name === this.notificationRequestedTo;
        this.displayActionButtons =
          details.typeContent.approvalStatus === 'REQUESTED' || details.typeContent.approvalStatus === 'CANCELLED';
      })
    );
    this.setNotificationViewed(this.notificationUid);
  }
  /**
   * Function used to approve link to parent request
   * @param {void}
   * @return {void}
   */
  public approveRequest() {
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }
      const requestParameter = {
        createdByUserUID: this.notification.createdByUserUID,
        notificationUid: this.notification.notificationUid,
        rejectionReason: null,
        type: 'LINKTOPARENTAPPROVED',
        approvalStatus: 'APPROVED',
        subEstablishmentId: this.notification.typeContent.subEstablishmentId || null,
        parentEstablishmentId: this.notification.typeContent.parentEstablishmentId || null,
      };
      this.subscriptions.add(
        this.notificationsService
          .setNotificationRequestLinkToParent(this.establishmentService.establishmentId, requestParameter)
          .subscribe(
            request => {
              if (request) {
                this.establishmentService.getEstablishment(this.workplace.uid).subscribe(workplace => {
                  if (workplace) {
                    //get permission and reset
                    this.permissionsService.getPermissions(this.workplace.uid).subscribe(hasPermission => {
                      if (hasPermission) {
                        this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
                        this.establishmentService.setState(workplace);
                        this.establishmentService.setPrimaryWorkplace(workplace);
                        this.router.navigate(['/dashboard']);
                        this.alertService.addAlert({
                          type: 'success',
                          message: `Your decision to link to you has been sent to ${this.notification.typeContent.requestorName} `,
                        });
                      }
                    });
                  }
                });
                //get all notification and update with latest
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
  /**
   * Function used to get reject request event for link to parent request rejection
   * @param {$event} triggred event
   * @return {void}
   */
  public rejectRequest($event: Event) {
    $event.preventDefault();
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }
      const dialog = this.dialogService.open(RejectRequestDialogComponent, this.notification);
      dialog.afterClosed.subscribe(
        requestRejected => {
          if (requestRejected) {
            this.rejectLinkToParentRequest(requestRejected);
          }
        },
        error => console.log('Could not update notification.')
      );
    }
  }
  /**
   * Function used to reject link to parent request and triggred from rejectRequest
   * @param {$event} triggred event
   * @return {void}
   */
  private rejectLinkToParentRequest(requestRejected) {
    const requestParameter = {
      createdByUserUID: this.notification.createdByUserUID,
      notificationUid: this.notification.notificationUid,
      rejectionReason: requestRejected.rejectionReason,
      type: 'LINKTOPARENTREJECTED',
      approvalStatus: 'DENIED',
      subEstablishmentId: this.notification.typeContent.subEstablishmentId || null,
      parentEstablishmentId: this.notification.typeContent.parentEstablishmentId || null,
    };
    this.subscriptions.add(
      this.notificationsService
        .setNotificationRequestLinkToParent(this.establishmentService.establishmentId, requestParameter)
        .subscribe(
          request => {
            if (request) {
              //get all notification and update with latest status
              this.notificationsService.getAllNotifications().subscribe(notify => {
                this.notificationsService.notifications$.next(notify);
              });
              this.router.navigate(['/dashboard']);
              this.alertService.addAlert({
                type: 'success',
                message: `Your decision to link to you has been sent to ${this.notification.typeContent.requestorName} `,
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
