import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { UserDetails } from '@core/model/userDetails.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { isAdminRole } from '@core/utils/check-role-util';
import { BecomeAParentCancelDialogComponent } from '@shared/components/become-a-parent-cancel/become-a-parent-cancel-dialog.component';
import { BecomeAParentDialogComponent } from '@shared/components/become-a-parent/become-a-parent-dialog.component';
import { LinkToParentCancelDialogComponent } from '@shared/components/link-to-parent-cancel/link-to-parent-cancel-dialog.component';
import { LinkToParentDialogComponent } from '@shared/components/link-to-parent/link-to-parent-dialog.component';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any;
  }
}

window.dataLayer = window.dataLayer || {};
@Component({
  selector: 'app-new-home-tab',
  templateUrl: './home-tab.component.html',
  providers: [ServiceNamePipe],
})
export class NewHomeTabComponent implements OnInit, OnDestroy {
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
  public user: UserDetails;
  public workplaceSummaryMessage: string;
  public workersCreatedDate;
  public workerCount: number;
  public workersNotCompleted: Worker[];
  public addWorkplaceDetailsBanner: boolean;
  public bigThreeServices: boolean;
  public hasBenchmarkComparisonData: boolean;

  constructor(
    private userService: UserService,
    private permissionsService: PermissionsService,
    private parentRequestsService: ParentRequestsService,
    private dialogService: DialogService,
    private tabsService: TabsService,
    private route: ActivatedRoute,
    @Inject(WindowToken) private window: Window,
    private serviceNamePipe: ServiceNamePipe,
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

    this.bigThreeServices = [1, 2, 8].includes(this.workplace.mainService.reportingID);
    this.hasBenchmarkComparisonData = !!this.meta?.staff && !!this.meta?.workplaces;
    this.setBenchmarksCard();
    this.subscriptions.add();
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
    // this.canAddWorker = this.permissionsService.can(workplaceUid, 'canAddWorker');
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

    // if (this.canViewChangeDataOwner && this.workplace.dataOwnershipRequested) {
    //   this.isOwnershipRequested = true;
    // }

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
