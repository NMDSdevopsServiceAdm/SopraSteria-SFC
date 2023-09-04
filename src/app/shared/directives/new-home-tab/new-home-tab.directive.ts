import { Directive, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { UserDetails } from '@core/model/userDetails.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { BecomeAParentCancelDialogComponent } from '@shared/components/become-a-parent-cancel/become-a-parent-cancel-dialog.component';
import { BecomeAParentDialogComponent } from '@shared/components/become-a-parent/become-a-parent-dialog.component';
import { LinkToParentCancelDialogComponent } from '@shared/components/link-to-parent-cancel/link-to-parent-cancel-dialog.component';
import { LinkToParentDialogComponent } from '@shared/components/link-to-parent/link-to-parent-dialog.component';
import { ChangeDataOwnerDialogComponent } from '@shared/components/change-data-owner-dialog/change-data-owner-dialog.component';
import { CancelDataOwnerDialogComponent } from '@shared/components/cancel-data-owner-dialog/cancel-data-owner-dialog.component';
import { LinkToParentRemoveDialogComponent } from '@shared/components/link-to-parent-remove/link-to-parent-remove-dialog.component';
import { OwnershipChangeMessageDialogComponent } from '@shared/components/ownership-change-message/ownership-change-message-dialog.component';

import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import saveAs from 'file-saver';
import { Subscription } from 'rxjs';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any;
  }
}

window.dataLayer = window.dataLayer || {};

@Directive()
export class NewHomeTabDirective implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() meta: Meta;

  private subscriptions: Subscription = new Subscription();
  public benchmarksMessage: string;
  public canViewWorkplaces: boolean;
  public canViewReports: boolean;
  public canViewChangeDataOwner: boolean;
  public canViewDataPermissionsLink: boolean;
  public canLinkToParent: boolean;
  public canRemoveParentAssociation: boolean;
  public canBecomeAParent: boolean;
  public linkToParentRequestedStatus: boolean;
  public parentStatusRequested: boolean;
  public isLocalAuthority = false;
  public canRunLocalAuthorityReport: boolean;
  public canBulkUpload: boolean;
  public canEditEstablishment: boolean;
  public canViewListOfWorkers: boolean;
  public trainingCounts: TrainingCounts;
  public now: Date = new Date();
  public user: UserDetails;
  public workplaceSummaryMessage: string;
  public workersCreatedDate;
  public workerCount: number;
  public workersNotCompleted: Worker[];
  public addWorkplaceDetailsBanner: boolean;
  public bigThreeServices: boolean;
  public hasBenchmarkComparisonData: boolean;
  public isParent: boolean;
  public certificateYears: string;
  public newHomeDesignParentFlag: boolean;
  public parentRequestAlertMessage: string;
  public isParentApprovedBannerViewed: boolean;
  public isOwnershipRequested = false;
  public canAddWorker: boolean;
  public ownershipChangeRequestId: any = [];

  constructor(
    private userService: UserService,
    private permissionsService: PermissionsService,
    private parentRequestsService: ParentRequestsService,
    private dialogService: DialogService,
    private tabsService: TabsService,
    private route: ActivatedRoute,
    @Inject(WindowToken) private window: Window,
    private serviceNamePipe: ServiceNamePipe,
    private reportsService: ReportService,
    private featureFlagsService: FeatureFlagsService,
    private alertService: AlertService,
    private router: Router,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    const {
      workersCreatedDate,
      workerCount = 0,
      trainingCounts,
      workersNotCompleted,
    } = this.route.snapshot.data.workers;
    this.workersCreatedDate = workersCreatedDate;
    this.workerCount = workerCount;
    this.trainingCounts = trainingCounts;
    this.workersNotCompleted = workersNotCompleted;

    this.user = this.userService.loggedInUser;
    this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
    this.setPermissionLinks();

    this.isParent = this.workplace?.isParent;

    this.newHomeDesignParentFlag = this.featureFlagsService.newHomeDesignParentFlag;

    if (this.workplace) {
      this.subscriptions.add(
        this.parentRequestsService.parentStatusRequested(this.workplace.id).subscribe((parentStatusRequested) => {
          this.parentStatusRequested = parentStatusRequested;
          this.setPermissionLinks();
        }),
      );

      this.isLocalAuthority =
        this.workplace.employerType && this.workplace.employerType.value.toLowerCase().startsWith('local authority');

      this.canRunLocalAuthorityReport =
        this.workplace.isParent &&
        this.isLocalAuthority &&
        this.permissionsService.can(this.workplace.uid, 'canRunLocalAuthorityReport');
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

    const currentYear = this.now.getFullYear();
    if (this.now.getMonth() >= 4) {
      this.certificateYears = `${currentYear} to ${currentYear + 1}`;
    } else {
      this.certificateYears = `${currentYear - 1} to ${currentYear}`;
    }

    this.bigThreeServices = [1, 2, 8].includes(this.workplace.mainService.reportingID);
    this.hasBenchmarkComparisonData = !!this.meta?.staff && !!this.meta?.workplaces;
    this.setBenchmarksCard();
    this.subscriptions.add();

    this.parentRequestAlertMessage = history.state?.parentRequestMessage;

    this.isParentApprovedBannerViewed = this.workplace.isParentApprovedBannerViewed;

    this.sendAlert();
  }

  private setBenchmarksCard(): void {
    if (this.hasBenchmarkComparisonData) {
      const serviceName = this.serviceNamePipe.transform(this.workplace.mainService.name);
      const localAuthority = this.meta?.localAuthority.replace(/&/g, 'and');
      const noOfWorkplacesText =
        this.meta.workplaces === 1
          ? `There is ${this.meta.workplaces} workplace`
          : `There are ${this.meta.workplaces} workplaces`;
      const serviceText = this.bigThreeServices ? `${serviceName.toLowerCase()}` : 'adult social care';
      this.benchmarksMessage = `${noOfWorkplacesText} providing ${serviceText} in ${localAuthority}.`;
    } else {
      this.benchmarksMessage = `Benchmarks can show how you're doing when it comes to pay, recruitment and retention.`;
    }
  }

  ngOnChanges() {
    this.setBenchmarksCard();
  }

  public navigateToTab(event: Event, selectedTab: string): void {
    event.preventDefault();
    this.tabsService.selectedTab = selectedTab;
  }

  /**
   * This function is used to set the permission links
   * @param {void}
   * @return {void}
   */
  public setPermissionLinks(): void {
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

  /**
   * Function used to open modal box for link a workplace to parent organisation
   * @param {event} triggered event
   * @return {void}
   */
  public linkToParent($event: Event): void {
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
   * @param {event} triggered event
   * @return {void}
   */
  public cancelLinkToParent($event: Event): void {
    $event.preventDefault();
    const dialog = this.dialogService.open(LinkToParentCancelDialogComponent, this.workplace);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.linkToParentRequestedStatus = false;
        this.canBecomeAParent = true;
      }
    });
  }

  public becomeAParent($event: Event): void {
    $event.preventDefault();
    const dialog = this.dialogService.open(BecomeAParentDialogComponent, null);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.canLinkToParent = false;
        this.parentStatusRequested = true;
      }
    });
  }

  public cancelBecomeAParent($event: Event): void {
    $event.preventDefault();
    const dialog = this.dialogService.open(BecomeAParentCancelDialogComponent, null);
    dialog.afterClosed.subscribe((confirmToClose) => {
      if (confirmToClose) {
        this.canLinkToParent = true;
        this.parentStatusRequested = false;
      }
    });
  }

  public downloadLocalAuthorityReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getLocalAuthorityReport(this.workplace.uid).subscribe((response) => this.saveFile(response)),
    );
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  }

  public sendAlert(): void {
    if (this.parentRequestAlertMessage) {
      this.alertService.addAlert({
        type: 'success',
        message: this.parentRequestAlertMessage,
      });
    } else if (this.isParentApprovedBannerViewed === false) {
      this.alertService.addAlert({
        type: 'success',
        message: `Your request to become a parent has been approved`,
      });
    }
  }

  public updateIsParentApprovedBannerViewed(): void {
    if (this.isParentApprovedBannerViewed === false) {
      this.workplace.isParentApprovedBannerViewed = true;
      const data = {
        property: 'isParentApprovedBannerViewed',
        value: true,
      };

      this.subscriptions.add(
        this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, data).subscribe(),
      );
    }
  }

  public goToAboutParentsLink(): void {
    this.router.navigate(['/about-parents']);
  }

  private changeDataOwnerLink(): void {
    this.isOwnershipRequested = !this.isOwnershipRequested;
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

  ngOnDestroy(): void {
    this.updateIsParentApprovedBannerViewed();
    this.subscriptions.unsubscribe();
    this.alertService.removeAlert();
  }
}
