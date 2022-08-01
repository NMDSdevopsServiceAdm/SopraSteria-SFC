import { Overlay } from '@angular/cdk/overlay';
import { HttpResponse } from '@angular/common/http';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WorkerService } from '@core/services/worker.service';
import {
  BecomeAParentCancelDialogComponent,
} from '@shared/components/become-a-parent-cancel/become-a-parent-cancel-dialog.component';
import { BecomeAParentDialogComponent } from '@shared/components/become-a-parent/become-a-parent-dialog.component';
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
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import saveAs from 'file-saver';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { isAdminRole } from 'server/utils/adminUtils';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any;
  }
}

window.dataLayer = window.dataLayer || {};
@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',

  providers: [DialogService, Overlay],
})
export class HomeTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workerCount: number;

  private subscriptions: Subscription = new Subscription();
  public canBulkUpload: boolean;
  public canEditEstablishment: boolean;
  public canViewWorkplaces: boolean;
  public canViewReports: boolean;
  public isParent: boolean;
  public user: UserDetails;
  public canViewChangeDataOwner: boolean;
  public canViewDataPermissionsLink: boolean;
  public ownershipChangeRequestId: any = [];
  public isOwnershipRequested = false;
  public primaryWorkplace: Establishment;
  public canLinkToParent: boolean;
  public canBecomeAParent: boolean;
  public linkToParentRequestedStatus: boolean;
  public parentStatusRequested: boolean;
  public canRemoveParentAssociation: boolean;
  public canAddWorker: boolean;
  public canViewListOfWorkers: boolean;
  public isLocalAuthority = false;
  public canRunLocalAuthorityReport: boolean;
  public workplaceUid: string;
  public now: Date = new Date();
  public wdfNewDesignFlag: boolean;
  public recruitmentJourneyExistingUserBanner: boolean;
  public addWorkplaceDetailsBanner: boolean;

  constructor(
    private bulkUploadService: BulkUploadService,
    private permissionsService: PermissionsService,
    private parentRequestsService: ParentRequestsService,
    private userService: UserService,
    public workerService: WorkerService,
    private dialogService: DialogService,
    private alertService: AlertService,
    private router: Router,
    private establishmentService: EstablishmentService,
    private reportsService: ReportService,
    private featureFlagsService: FeatureFlagsService,
    @Inject(WindowToken) private window: Window,
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = this.userService.loggedInUser;
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.recruitmentJourneyExistingUserBanner = this.primaryWorkplace.recruitmentJourneyExistingUserBanner;
    this.addWorkplaceDetailsBanner = this.primaryWorkplace.showAddWorkplaceDetailsBanner;
    this.setPermissionLinks();

    if (this.workplace) {
      this.subscriptions.add(
        this.parentRequestsService.parentStatusRequested(this.workplace.id).subscribe((parentStatusRequested) => {
          this.parentStatusRequested = parentStatusRequested;
          this.setPermissionLinks();
        }),
      );

      this.subscriptions.add(
        this.establishmentService.establishment$.pipe(take(1)).subscribe((workplace) => {
          this.isLocalAuthority =
            this.workplace.employerType && this.workplace.employerType.value.startsWith('Local Authority');

          this.canRunLocalAuthorityReport =
            this.workplace.isParent &&
            this.isLocalAuthority &&
            this.permissionsService.can(this.workplace.uid, 'canRunLocalAuthorityReport');
        }),
      );
    }

    this.window.dataLayer.push({
      isAdmin: isAdminRole(this.user.role),
    });

    if (this.addWorkplaceDetailsBanner) {
      this.window.dataLayer.push({
        firstTimeLogin: true,
        workplaceID: this?.workplace?.nmdsId ? this.workplace.nmdsId : null,
      });
      this.window.dataLayer.push({
        event: 'firstLogin',
      });
    }
    this.wdfNewDesignFlag = await this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false);
  }

  public downloadLocalAuthorityReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getLocalAuthorityReport(this.workplace.uid).subscribe((response) => this.saveFile(response)),
    );
  }

  public onChangeDataOwner($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(ChangeDataOwnerDialogComponent, this.workplace);
    dialog.afterClosed.subscribe((changeDataOwnerConfirmed) => {
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
        (data) => {
          if (data && data.length > 0) {
            data.forEach((element) => {
              this.ownershipChangeRequestId.push(element.ownerChangeRequestUID);
            });
            this.workplace.ownershipChangeRequestId = this.ownershipChangeRequestId;
            const dialog = this.dialogService.open(CancelDataOwnerDialogComponent, this.workplace);
            dialog.afterClosed.subscribe((cancelDataOwnerConfirmed) => {
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
        (error) => {
          console.error(error.error.message);
        },
      ),
    );
  }

  public setDataPermissions($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(SetDataPermissionDialogComponent, this.workplace);
    dialog.afterClosed.subscribe((setPermissionConfirmed) => {
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
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = true;
        this.canBecomeAParent = false;
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
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = false;
        this.canBecomeAParent = true;
      }
    });
  }
  /**
   * This function is used to open a conditional dialog window
   * open ownership change message dialog if canViewChangeDataOwner flag is true
   * else remove link to parent dialog.
   * This method is also reset the current estrablishment and permissions after delink api return 200
   * from LinkToParentRemoveDialogComponent.
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
    dialog.afterClosed.subscribe((returnToClose) => {
      if (returnToClose) {
        //if return  from LinkToParentRemoveDialogComponent then proceed to delink request
        if (returnToClose.closeFrom === 'remove-link') {
          this.establishmentService.getEstablishment(this.workplace.uid).subscribe((workplace) => {
            if (workplace) {
              //get permission and reset latest value
              this.permissionsService.getPermissions(this.workplace.uid).subscribe((hasPermission) => {
                if (hasPermission) {
                  this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
                  this.establishmentService.setState(workplace);
                  this.establishmentService.setPrimaryWorkplace(workplace);
                  this.workplace.parentUid = null; // update on @input object
                  this.setPermissionLinks();
                  this.router.navigate(['/dashboard']);
                  this.alertService.addAlert({
                    type: 'success',
                    message: `You're no longer linked to your parent organisation.`,
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

  public becomeAParent($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(BecomeAParentDialogComponent, null);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.canLinkToParent = false;
        this.parentStatusRequested = true;
      }
    });
  }

  public cancelBecomeAParent($event: Event) {
    $event.preventDefault();
    const dialog = this.dialogService.open(BecomeAParentCancelDialogComponent, null);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.canLinkToParent = true;
        this.parentStatusRequested = false;
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
    this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canBulkUpload = this.permissionsService.can(workplaceUid, 'canBulkUpload');
    this.canViewWorkplaces = this.workplace && this.workplace.isParent;
    this.canViewChangeDataOwner =
      this.workplace &&
      this.workplace.parentUid != null &&
      this.workplace.dataOwner !== 'Workplace' &&
      this.user.role != 'Read';
    this.canViewDataPermissionsLink =
      this.workplace &&
      this.workplace.parentUid != null &&
      this.workplace.dataOwner === 'Workplace' &&
      this.user.role != 'Read';
    this.canViewReports =
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport');

    if (this.canViewChangeDataOwner && this.workplace.dataOwnershipRequested) {
      this.isOwnershipRequested = true;
    }

    if (isAdminRole(this.user.role)) {
      this.canLinkToParent = this.workplace && this.workplace.parentUid === null && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.workplace && this.workplace.parentUid !== null;
    } else {
      this.canLinkToParent =
        this.permissionsService.can(workplaceUid, 'canLinkToParent') && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.permissionsService.can(workplaceUid, 'canRemoveParentAssociation');
    }
    if (this.canLinkToParent && this.workplace.linkToParentRequested) {
      this.linkToParentRequestedStatus = true;
    }
    this.canBecomeAParent =
      this.permissionsService.can(workplaceUid, 'canBecomeAParent') && !this.linkToParentRequestedStatus;
  }

  public selectStaffTab(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.workerService.tabChanged.next(true);
  }

  public selectTotalStaff(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.establishmentService.setReturnTo({ url: ['/dashboard'], fragment: 'home' });
    this.router.navigate(['/workplace', this.workplace.uid, 'total-staff']);
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  }

  public convertToDate(dateString: string): Date {
    return new Date(dateString);
  }

  public setRecuritmentBannerToTrue(event: Event) {
    event.preventDefault();
    if (this.canEditEstablishment) {
      const data = { property: 'recruitmentJourneyExistingUserBanner', value: true };
      this.subscriptions.add(
        this.establishmentService
          .updateWorkplaceBanner(this.workplace.uid, data)
          .subscribe(() => this.router.navigate(['/workplace', this.workplace.uid, 'staff-recruitment-start'])),
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
