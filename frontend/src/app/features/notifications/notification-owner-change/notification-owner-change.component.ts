import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { RejectRequestDialogComponent } from '@shared/components/reject-request-dialog/reject-request-dialog.component';
import { Observable, Subscription } from 'rxjs';

const OWNERSHIP_APPROVED = 'OWNERCHANGEAPPROVED';
const OWNERSHIP_REJECTED = 'OWNERCHANGEREJECTED';

@Component({
    selector: 'app-notification-owner-change',
    templateUrl: './notification-owner-change.component.html',
    styleUrls: ['../notification/notification.component.scss'],
    providers: [DialogService, Overlay],
    standalone: false
})
export class NotificationOwnerChangeComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  @Input() public notification;
  @Input() public events: Observable<string>;
  private subscriptions: Subscription = new Subscription();
  private eventsSubscription: Subscription;
  public displayActionButtons;
  public notificationUid: string;
  public isWorkPlaceIsRequester: boolean;
  public ownerShipRequestedFrom: string;
  public ownerShipRequestedTo: string;
  public isSubWorkplace: boolean;
  private ownerShipRequestedToUid: string;
  public ownerShipRequestedFromPostCode: string;
  public ownerShipRequestedToPostCode: string;

  constructor(
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private router: Router,
    private permissionsService: PermissionsService,
    private alertService: AlertService,
    private notificationsService: NotificationsService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.eventsSubscription = this.events.subscribe((action) => this.performAction(action));
    this.workplace = this.establishmentService.primaryWorkplace;

    this.setOwnershipRequestVariables();

    this.notificationUid = this.route.snapshot.params.notificationuid;
    if (this.notification.typeContent.approvalStatus === 'APPROVED') {
      this.isWorkPlaceIsRequester = this.workplace.name !== this.ownerShipRequestedFrom;
    } else {
      this.isWorkPlaceIsRequester = this.workplace.name === this.ownerShipRequestedFrom;
    }
  }

  private setOwnershipRequestVariables(): void {
    const {
      requestedOwnerType,
      subEstablishmentName,
      subEstablishmentUid,
      subPostCode,
      parentEstablishmentName,
      parentEstablishmentUid,
      parentPostCode,
    } = this.notification.typeContent;

    if (requestedOwnerType === 'Workplace') {
      this.ownerShipRequestedFrom = parentEstablishmentName;
      this.ownerShipRequestedTo = subEstablishmentName;
      this.ownerShipRequestedToUid = subEstablishmentUid;
      this.ownerShipRequestedFromPostCode = parentPostCode;
      this.ownerShipRequestedToPostCode = subPostCode;
    } else {
      this.ownerShipRequestedFrom = subEstablishmentName;
      this.ownerShipRequestedTo = parentEstablishmentName;
      this.ownerShipRequestedToUid = parentEstablishmentUid;
      this.ownerShipRequestedFromPostCode = subPostCode;
      this.ownerShipRequestedToPostCode = parentPostCode;
    }
  }

  private performAction(action: string) {
    if (action === 'APPROVE') {
      this.approveRequest();
    }
    if (action === 'REJECT') {
      this.rejectRequest();
    }
  }

  private approveRequest() {
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }

      const requestParameter = {
        approvalStatus: 'APPROVED',
        rejectionReason: null,
        type: OWNERSHIP_APPROVED,
        existingNotificationUid: this.notificationUid,
        requestorUid: this.ownerShipRequestedToUid,
      };

      this.subscriptions.add(
        this.notificationsService
          .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
          .subscribe(
            (request) => {
              if (request) {
                this.establishmentService.getEstablishment(this.workplace.uid).subscribe((workplace) => {
                  if (workplace) {
                    this.permissionsService.getPermissions(this.workplace.uid).subscribe((hasPermission) => {
                      if (hasPermission) {
                        this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
                        this.establishmentService.setState(workplace);
                        this.establishmentService.setPrimaryWorkplace(workplace);
                        this.router.navigate(['/dashboard']);
                        this.alertService.addAlert({
                          type: 'success',
                          message: `Your decision to transfer ownership of data has been sent to
                      ${this.ownerShipRequestedTo} `,
                        });
                      }
                    });
                  }
                });
                this.notificationsService.getAllNotifications(this.workplace.uid).subscribe((notify) => {
                  this.notificationsService.notifications = notify.notifications;
                });
              }
            },
            (error) => {
              console.error(error.error.message);
            },
          ),
      );
    }
  }

  private rejectRequest() {
    if (this.notification) {
      if (this.notification.typeContent.approvalStatus === 'CANCELLED') {
        this.router.navigate(['/notifications/notification-cancelled', this.notification.notificationUid]);
        return true;
      }

      const dialog = this.dialogService.open(RejectRequestDialogComponent, this.notification);
      dialog.afterClosed.subscribe((requestRejected) => {
        if (requestRejected) {
          this.rejectPermissionRequest(requestRejected);
        }
      });
    }
  }

  private rejectPermissionRequest(requestRejected) {
    const requestParameter = {
      approvalStatus: 'DENIED',
      rejectionReason: requestRejected.rejectionReason,
      type: OWNERSHIP_REJECTED,
      existingNotificationUid: this.notification.notificationUid,
      requestorUid: this.ownerShipRequestedToUid,
    };
    this.subscriptions.add(
      this.notificationsService
        .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
        .subscribe(
          (request) => {
            if (request) {
              this.notificationsService.getAllNotifications(this.workplace.uid).subscribe((notify) => {
                this.notificationsService.notifications = notify.notifications;
              });
              this.router.navigate(['/dashboard']);
              this.alertService.addAlert({
                type: 'success',
                message: `Your decision to transfer ownership of data has been sent to
                  ${this.ownerShipRequestedTo} `,
              });
            }
          },
          (error) => {
            console.log('Could not update notification.');
          },
        ),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.eventsSubscription.unsubscribe();
  }
}