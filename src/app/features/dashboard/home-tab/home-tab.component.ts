import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import {
  CancelDataOwnerDialogComponent,
} from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import {
  ChangeDataOwnerDialogComponent,
} from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import {
  LinkToParentCancelDialogComponent,
} from '@shared/components/link-to-parent-cancel/link-to-parent-cancel-dialog.component';
import {
  LinkToParentRemoveDialogComponent,
} from '@shared/components/link-to-parent-remove/link-to-parent-remove-dialog.component';
import { LinkToParentDialogComponent } from '@shared/components/link-to-parent/link-to-parent-dialog.component';
import {
  OwnershipChangeMessageDialogComponent,
} from '@shared/components/ownership-change-message/ownership-change-message-dialog.component';
import {
  SetDataPermissionDialogComponent,
} from '@shared/components/set-data-permission/set-data-permission-dialog.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',

  providers: [DialogService, Overlay],
})
export class HomeTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public adminRole: Roles = Roles.Admin;
  public canBulkUpload: boolean;
  public canEditEstablishment: boolean;
  public canViewWorkplaces: boolean;
  public canViewReports: boolean;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public user: UserDetails;
  public canViewChangeDataOwner: boolean;
  public canViewDataPermissionsLink: boolean;
  public ownershipChangeRequestId: any = [];
  public isOwnershipRequested = false;
  public primaryWorkplace: Establishment;
  public canLinkToParent: boolean;
  public canBecomeAParent: boolean;
  public linkToParentRequestedStatus: boolean;
  public canRemoveParentAssociation: boolean;
  public canAddWorker: boolean;

  constructor(
    private bulkUploadService: BulkUploadService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService,
    private dialogService: DialogService,
    private alertService: AlertService,
    private router: Router,
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.user = this.userService.loggedInUser;
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    if (this.workplace && this.canEditEstablishment) {
      this.subscriptions.add(
        this.workerService.workers$.pipe(filter(workers => workers !== null)).subscribe(workers => {
          this.updateStaffRecords = !(workers.length > 0);
        })
      );
    }
    this.setPermissionLinks();
  }

  public onChangeDataOwner($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(ChangeDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(changeDataOwnerConfirmed => {
      if (changeDataOwnerConfirmed) {
        this.changeDataOwnerLink();
        this.router.navigate(['/dashboard']);
        this.alertService.addAlert({
          type: 'success',
          message: `Request to change data owner has been sent to ${this.workplace.parentName} `,
        });
      }
    });
  }

  public cancelChangeDataOwnerRequest($event: Event) {
    $event.preventDefault();
    this.ownershipChangeRequestId = [];
    this.subscriptions.add(
      this.establishmentService.changeOwnershipDetails(this.workplace.uid).subscribe(
        data => {
          if (data && data.length > 0) {
            data.forEach(element => {
              this.ownershipChangeRequestId.push(element.ownerChangeRequestUID);
            });
            this.workplace.ownershipChangeRequestId = this.ownershipChangeRequestId;
            const dialog = this.dialogService.open(CancelDataOwnerDialogComponent, this.workplace);
            dialog.afterClosed.subscribe(cancelDataOwnerConfirmed => {
              if (cancelDataOwnerConfirmed) {
                this.changeDataOwnerLink();
                this.router.navigate(['/dashboard']);
                this.alertService.addAlert({
                  type: 'success',
                  message: 'Request to change data owner has been cancelled ',
                });
              }
            });
          }
        },
        error => {
          console.error(error.error.message);
        }
      )
    );
  }

  public setDataPermissions($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(SetDataPermissionDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(setPermissionConfirmed => {
      if (setPermissionConfirmed) {
        this.changeDataOwnerLink();
        this.router.navigate(['/dashboard']);
        this.alertService.addAlert({
          type: 'success',
          message: `Data permissions for ${this.workplace.parentName} have been set.`,
        });
      }
    });
  }

  private changeDataOwnerLink(): void {
    this.isOwnershipRequested = !this.isOwnershipRequested;
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dashboard'] });
  }

  /**
   * Function used to open modal box for link a workplace to parent organisation
   * @param {event} triggred event
   * @return {void}
   */
  public linkToParent($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(LinkToParentDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(confirmToClose => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = true;
      }
    });
  }

  /**
   * Function used to open modal box for link a workplace to parent organisation
   * @param {event} triggred event
   * @return {void}
   */
  public cancelLinkToParent($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(LinkToParentCancelDialogComponent, this.workplace);
    dialog.afterClosed.subscribe(confirmToClose => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = false;
      }
    });
  }
  /**
   * This function is used to open a conditional dialog window
   * open ownership change message dialog if canViewChangeDataOwner flag is true
   * else remove link to parent dialog.
   * his method is also reset the current estrablishment and permissions after delink api return 200
   * from LinkToParentRemoveDialogComponent.
   *
   * @param {event} triggred event
   * @return {void}
   */
  public removeLinkToParent($event: Event) {
    $event.preventDefault();
    let dialog;
    if (this.canViewChangeDataOwner) {
      dialog = this.dialogService.open(OwnershipChangeMessageDialogComponent, this.workplace);
    } else {
      dialog = this.dialogService.open(LinkToParentRemoveDialogComponent, this.workplace);
    }
    dialog.afterClosed.subscribe(returnToClose => {
      if (returnToClose) {
        //if return  from LinkToParentRemoveDialogComponent then proceed to delink request
        if (returnToClose.closeFrom === 'remove-link') {
          this.establishmentService.getEstablishment(this.workplace.uid).subscribe(workplace => {
            if (workplace) {
              //get permission and reset latest value
              this.permissionsService.getPermissions(this.workplace.uid).subscribe(hasPermission => {
                if (hasPermission) {
                  this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
                  this.establishmentService.setState(workplace);
                  this.establishmentService.setPrimaryWorkplace(workplace);
                  this.workplace.parentUid = null; // update on @input object
                  this.setPermissionLinks();
                  this.router.navigate(['/dashboard']);
                  this.alertService.addAlert({
                    type: 'success',
                    message: `You are no longer linked to your parent orgenisation.`,
                  });
                }
              });
            }
          });
        }
        //if return from OwnershipChangeMessageDialogComponent then open change data owner dialog in case
        //of isOwnershipRequested flag false else cancel change data owner dialog .
        if (returnToClose.closeFrom === 'ownership-change') {
          if (this.isOwnershipRequested) {
            this.cancelChangeDataOwnerRequest($event);
          } else {
            this.onChangeDataOwner($event);
          }
        }
      }
    });
  }
  /**
   * This function is used to set the permission links
   * @param {void}
   * @return {void}
   */
  public setPermissionLinks() {
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canEditEstablishment = this.permissionsService.can(workplaceUid, 'canEditEstablishment');
    this.canAddWorker = this.permissionsService.can(workplaceUid, 'canAddWorker');
    this.canBulkUpload = this.permissionsService.can(workplaceUid, 'canBulkUpload');
    this.canViewWorkplaces = this.workplace && this.workplace.isParent;
    this.canViewChangeDataOwner =
      this.workplace && this.workplace.parentUid != null && this.workplace.dataOwner !== 'Workplace' && this.user.role!= 'Read';
    this.canViewDataPermissionsLink =
      this.workplace && this.workplace.parentUid != null && this.workplace.dataOwner === 'Workplace' && this.user.role!= 'Read';
    this.canViewReports =
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport');

    if (this.canViewChangeDataOwner && this.workplace.dataOwnershipRequested) {
      this.isOwnershipRequested = true;
    }

    if (this.user.role === 'Admin') {
      this.canLinkToParent = this.workplace && this.workplace.parentUid === null;
      this.canRemoveParentAssociation = this.workplace && this.workplace.parentUid !== null;
    } else {
      this.canLinkToParent = this.permissionsService.can(workplaceUid, 'canLinkToParent');
      this.canRemoveParentAssociation = this.permissionsService.can(workplaceUid, 'canRemoveParentAssociation');
    }
    if (this.canLinkToParent && this.workplace.linkToParentRequested) {
      this.linkToParentRequestedStatus = true;
    }
    this.canBecomeAParent = this.permissionsService.can(workplaceUid, 'canBecomeAParent');
    console.log(this.canBecomeAParent);
  }
  //open Staff Tab
  public selectStaffTab(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.workerService.tabChanged.next(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
