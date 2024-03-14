import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-subsidiary-home',
  templateUrl: './view-subsidiary-home.component.html',
  providers: [ServiceNamePipe],
})
export class ViewSubsidiaryHomeComponent implements OnInit {
  public subId: string;
  public subsidiaryWorkplace: Establishment;
  public primaryEstablishment: Establishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
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
  public alertMessage: string;
  public showMissingCqcMessage: boolean;
  public locationId: string;
  public workplacesCount: number;
  public isParentSubsidiaryView: boolean;

  constructor(
    private userService: UserService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    public route: ActivatedRoute,
    private featureFlagsService: FeatureFlagsService,
    private router: Router,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.subsidiaryWorkplace = this.route.snapshot.data.establishment;
    this.workersCreatedDate = this.route.snapshot.data.workers?.workersCreatedDate;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;
    this.workersNotCompleted = this.route.snapshot.data.workers?.workersNotCompleted;

    this.user = this.userService.loggedInUser;
    this.addWorkplaceDetailsBanner = this.subsidiaryWorkplace.showAddWorkplaceDetailsBanner;
    this.setPermissionLinks();

    this.subId = this.route.snapshot.data.establishment.uid;

    this.newHomeDesignParentFlag = this.featureFlagsService.newHomeDesignParentFlag;

    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();
    this.breadcrumbService.canShowBanner = true;
  }

  ngOnChanges(): void {}

  public setPermissionLinks(): void {
    const workplaceUid: string = this.subsidiaryWorkplace ? this.subsidiaryWorkplace.uid : null;
    this.canEditEstablishment = this.permissionsService.can(workplaceUid, 'canEditEstablishment');
    this.canAddWorker = this.permissionsService.can(workplaceUid, 'canAddWorker');
    this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canBulkUpload = this.permissionsService.can(workplaceUid, 'canBulkUpload');
    this.canViewWorkplaces = this.subsidiaryWorkplace && this.subsidiaryWorkplace.isParent;
    this.canViewChangeDataOwner =
      this.subsidiaryWorkplace &&
      this.subsidiaryWorkplace.parentUid != null &&
      this.subsidiaryWorkplace.dataOwner !== 'Workplace' &&
      this.user.role != 'Read';
    this.canViewDataPermissionsLink =
      this.subsidiaryWorkplace &&
      this.subsidiaryWorkplace.parentUid != null &&
      this.subsidiaryWorkplace.dataOwner === 'Workplace' &&
      this.user.role != 'Read';
    this.canViewReports =
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport');

    this.canViewEstablishment = true;
    if (this.canViewChangeDataOwner && this.subsidiaryWorkplace.dataOwnershipRequested) {
      this.isOwnershipRequested = true;
    }

    if (isAdminRole(this.user.role)) {
      this.canLinkToParent =
        this.subsidiaryWorkplace && this.subsidiaryWorkplace.parentUid === null && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.subsidiaryWorkplace && this.subsidiaryWorkplace.parentUid !== null;
    } else {
      this.canLinkToParent =
        this.permissionsService.can(workplaceUid, 'canLinkToParent') && !this.parentStatusRequested;
      this.canRemoveParentAssociation = this.permissionsService.can(workplaceUid, 'canRemoveParentAssociation');
    }
    if (this.canLinkToParent && this.subsidiaryWorkplace.linkToParentRequested) {
      this.linkToParentRequestedStatus = true;
    }
    this.canBecomeAParent =
      this.permissionsService.can(workplaceUid, 'canBecomeAParent') && !this.linkToParentRequestedStatus;
  }

  public navigateToTab(event: Event, selectedTab: string): void {
    event.preventDefault();
    this.parentSubsidiaryViewService.showSelectedTab = selectedTab;
    this.tabsService.selectedTab = selectedTab;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.canShowBanner = false;
  }
}
