import { HttpResponse } from '@angular/common/http';
import { Directive, Inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '@core/model/article.model';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { UserDetails } from '@core/model/userDetails.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { isAdminRole } from '@core/utils/check-role-util';
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
import { LinkToParentDialogComponent } from '@shared/components/link-to-parent/link-to-parent-dialog.component';
import {
  OwnershipChangeMessageDialogComponent,
} from '@shared/components/ownership-change-message/ownership-change-message-dialog.component';
import {
  SetDataPermissionDialogComponent,
} from '@shared/components/set-data-permission/set-data-permission-dialog.component';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import saveAs from 'file-saver';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any;
  }
}

window.dataLayer = window.dataLayer || {};

@Directive()
export class NewHomeTabDirective implements OnInit, OnDestroy, OnChanges {
  @Input() workplace: Establishment;
  @Input() meta: Meta;

  public subscriptions: Subscription = new Subscription();
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
  public canEditWorker: boolean;
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
  public isParentApprovedBannerViewed: boolean;
  public isOwnershipRequested = false;
  public canAddWorker: boolean;
  public ownershipChangeRequestId: any = [];
  public successAlertMessage: string;
  public canViewEstablishment: boolean;
  public showMissingCqcMessage: boolean;
  public locationId: string;
  public workplacesCount: number;
  public isParentSubsidiaryView: boolean;
  public article: Article;
  public noOfWorkersWhoRequireInternationalRecruitment: number;
  public noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: number;
  public workplacesNeedAttention: boolean;

  constructor(
    private userService: UserService,
    private permissionsService: PermissionsService,
    private parentRequestsService: ParentRequestsService,
    private dialogService: DialogService,
    private tabsService: TabsService,
    public route: ActivatedRoute,
    @Inject(WindowToken) private window: Window,
    private serviceNamePipe: ServiceNamePipe,
    private reportsService: ReportService,
    private featureFlagsService: FeatureFlagsService,
    private alertService: AlertService,
    private router: Router,
    public establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workersCreatedDate = this.route.snapshot.data.workers?.workersCreatedDate;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;
    this.workersNotCompleted = this.route.snapshot.data.workers?.workersNotCompleted;
    this.noOfWorkersWhoRequireInternationalRecruitment =
      this.route.snapshot.data.noOfWorkersWhoRequireInternationalRecruitment?.noOfWorkersWhoRequireAnswers;

    this.noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered =
      this.route.snapshot.data.noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer?.noOfWorkersWhoRequireAnswers;

    this.user = this.userService.loggedInUser;
    this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
    this.setPermissionLinks();

    this.isParent = this.workplace?.isParent;

    this.newHomeDesignParentFlag = this.featureFlagsService.newHomeDesignParentFlag;

    this.article = this.route.snapshot.data.articleList?.data[0];

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
      userType: this.getUserType(),
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

    this.isParentApprovedBannerViewed = this.workplace.isParentApprovedBannerViewed;
    this.locationId = this.workplace.locationId;
    this.workplacesCount = this.route.snapshot.data.cqcLocations?.childWorkplacesCount;
    this.workplacesNeedAttention = this.route.snapshot.data?.cqcLocations?.showFlag;

    this.showMissingCqcMessage = this.route.snapshot.data?.cqcLocations?.showMissingCqcMessage;

    if (this.isParentApprovedBannerViewed === false) {
      this.showParentApprovedBanner();
    }

    this.updateLinkToParentRequestedStatus();
    this.updateParentStatusRequested();
    this.updateCancelLinkToParentRequest();
    this.updateOnRemoveLinkToParentSuccess();
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
    this.canEditWorker = this.permissionsService.can(workplaceUid, 'canEditWorker');
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
    this.canViewEstablishment = this.permissionsService.can(workplaceUid, 'canViewEstablishment');

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

  public showParentApprovedBanner(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `Your request to become a parent has been approved`,
    });
    this.updateIsParentApprovedBannerViewed();
  }

  public updateIsParentApprovedBannerViewed(): void {
    this.workplace.isParentApprovedBannerViewed = true;
    const data = {
      property: 'isParentApprovedBannerViewed',
      value: true,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, data).subscribe(),
    );
  }

  public goToAboutParentsLink(): void {
    this.router.navigate(['/workplace/about-parents']);
  }

  public updateLinkToParentRequestedStatus(): void {
    const linkToParentRequestedStatusState = history.state?.linkToParentRequestedStatus;
    if (linkToParentRequestedStatusState || linkToParentRequestedStatusState === false) {
      this.linkToParentRequestedStatus = history.state?.linkToParentRequestedStatus;
    }
  }

  public updateParentStatusRequested(): void {
    const parentStatusRequestedState = history.state?.parentStatusRequested;
    if (parentStatusRequestedState || parentStatusRequestedState === false) {
      this.parentStatusRequested = parentStatusRequestedState;
    }
  }

  public updateCancelLinkToParentRequest(): void {
    const cancelRequestToParentForLinkState = history.state?.cancelRequestToParentForLinkSuccess;
    if (cancelRequestToParentForLinkState) {
      this.linkToParentRequestedStatus = false;
      this.canBecomeAParent = true;
    }
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
   * @param {event} triggred event
   * @return {void}
   */
  public ownershipChangeMessage($event: Event) {
    $event.preventDefault();

    let dialog;
    if (this.canViewChangeDataOwner) {
      dialog = this.dialogService.open(OwnershipChangeMessageDialogComponent, this.workplace);
    }
    dialog.afterClosed.subscribe((returnToClose) => {
      if (returnToClose.closeFrom === 'ownership-change') {
        if (this.isOwnershipRequested) {
          this.cancelChangeDataOwnerRequest($event);
        } else {
          this.onChangeDataOwner($event);
        }
      }
    });
  }

  public updateOnRemoveLinkToParentSuccess(): void {
    const removeLinkToParentSuccess = history.state?.removeLinkToParentSuccess;

    if (removeLinkToParentSuccess) {
      this.establishmentService.getEstablishment(this.workplace.uid).subscribe((workplace) => {
        if (workplace) {
          this.permissionsService.getPermissions(this.workplace.uid).subscribe((hasPermission) => {
            if (hasPermission) {
              this.permissionsService.setPermissions(this.workplace.uid, hasPermission.permissions);
              this.establishmentService.setState(workplace);
              this.establishmentService.setPrimaryWorkplace(workplace);
              this.workplace.parentUid = null;
              this.setPermissionLinks();
            }
          });
        }
      });
    }
  }

  private getUserType(): string {
    if (isAdminRole(this.user.role)) return 'Admin';
    if (this.workplace.isParent) return 'Parent';
    if (this.workplace.parentUid) return 'Sub';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.alertService.removeAlert();
  }
}
