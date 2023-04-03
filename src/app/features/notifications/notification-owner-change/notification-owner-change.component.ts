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
import { Observable, Subject, Subscription } from 'rxjs';

const OWNERSHIP_APPROVED = 'OWNERCHANGEAPPROVED';
const OWNERSHIP_REJECTED = 'OWNERCHANGEREJECTED';

@Component({
  selector: 'app-notification-owner-change',
  templateUrl: './notification-owner-change.component.html',
  providers: [DialogService, Overlay],
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

  eventsSubject: Subject<string> = new Subject<string>();

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
    console.log(this.notification);
    this.eventsSubscription = this.events.subscribe((action) => this.performAction(action));
    this.workplace = this.establishmentService.primaryWorkplace;

    this.ownerShipRequestedFrom =
      this.notification.typeContent.requestedOwnerType === 'Workplace'
        ? this.notification.typeContent.parentEstablishmentName
        : this.notification.typeContent.subEstablishmentName;
    this.ownerShipRequestedTo =
      this.notification.typeContent.requestedOwnerType === 'Workplace'
        ? this.notification.typeContent.subEstablishmentName
        : this.notification.typeContent.parentEstablishmentName;

    this.notificationUid = this.route.snapshot.params.notificationuid;

    if (this.notification.typeContent.approvalStatus === 'APPROVED') {
      this.isWorkPlaceIsRequester = this.workplace.name !== this.ownerShipRequestedFrom;
    } else {
      this.isWorkPlaceIsRequester = this.workplace.name === this.ownerShipRequestedFrom;
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
        ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
        approvalStatus: 'APPROVED',
        approvalReason: '',
        rejectionReason: null,
        type: OWNERSHIP_APPROVED,
        existingNotificationUid: this.notificationUid,
        requestedOwnership: this.notification.typeContent.permissionRequest,
        parentEstablishmentUid: this.notification.typeContent.parentEstablishmentUid,
        subEstablishmentUid: this.notification.typeContent.subEstablishmentUid,
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
                      ${this.notification.typeContent.requestorName} `,
                        });
                      }
                    });
                  }
                });
                this.notificationsService.getAllNotifications(this.workplace.uid).subscribe((notify) => {
                  this.notificationsService.notifications$.next(notify);
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
      ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
      approvalStatus: 'DENIED',
      rejectionReason: requestRejected.rejectionReason,
      type: OWNERSHIP_REJECTED,
      existingNotificationUid: this.notification.notificationUid,
    };
    this.subscriptions.add(
      this.notificationsService
        .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
        .subscribe(
          (request) => {
            if (request) {
              this.notificationsService.getAllNotifications(this.workplace.uid).subscribe((notify) => {
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
