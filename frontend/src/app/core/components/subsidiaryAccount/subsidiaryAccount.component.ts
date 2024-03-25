import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subsidiary-account',
  templateUrl: './subsidiaryAccount.component.html',
  styleUrls: ['./subsidiaryAccount.component.scss'],
})
export class SubsidiaryAccountComponent implements OnInit, OnChanges {
  @Input() dashboardView: boolean;
  public canShowBanner = true;
  @Input() canAddWorker = false;
  public updatedDate: string;

  private subscriptions: Subscription = new Subscription();
  public workplaceUid: string;
  public workplaceId: number;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];
  public isParentSubsidiaryView: boolean;
  public parentWorkplaceName: string;
  public subWorkplace: Establishment;
  public subId: string;
  public selectedTab: string;
  public parentUid: string;
  public subsidiaryWorkplace: Establishment;
  public canEditWorker: boolean;
  public hasWorkers: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
    private breadcrumbService: BreadcrumbService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const { uid, id, name } = this.establishmentService.primaryWorkplace;
    this.workplaceUid = uid;
    console.log(this.workplaceUid);
    this.workplaceId = id;
    this.getPermissions();
    this.setTabs();
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    this.subId = this.parentSubsidiaryViewService.getSubsidiaryUid();

    this.setWorkplace();

    this.parentWorkplaceName = name;

    this.parentSubsidiaryViewService.canShowBannerObservable.subscribe((canShowBanner) => {
      this.canShowBanner = canShowBanner;
    });

    this.subscriptions.add(
      this.parentSubsidiaryViewService.showSelectedTab$.subscribe((selectedTab) => {
        this.selectedTab = selectedTab;
      }),
    );


    this.parentSubsidiaryViewService

    this.parentSubsidiaryViewService.getLastUpdatedDateObservable.subscribe((getLastUpdatedDate) => {
      this.updatedDate = getLastUpdatedDate;
    });

    this.parentSubsidiaryViewService;
  }

  ngOnChanges(): void {
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();
    this.getPermissions();
  }

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.subId, true).subscribe((workplace) => {
        this.subWorkplace = workplace;
        this.establishmentService.setState(workplace);
        this.parentWorkplaceName = this.subWorkplace?.parentName;
        this.parentUid = this.subWorkplace?.parentUid;
      }),
    );
    this.selectedTab = 'home';
  }

  public tabClickEvent(properties: { tabSlug: string }): void {
    this.selectedTab = properties.tabSlug;

    if (properties.tabSlug === 'benchmarks') {
      this.subscriptions.add(this.benchmarksService.postBenchmarkTabUsage(this.workplaceId).subscribe());
    }
  }

  private getPermissions(): void {
    this.canViewBenchmarks = this.permissionsService.can(this.workplaceUid, 'canViewBenchmarks') || true;
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.canAddWorker = this.permissionsService.can(this.workplaceUid, 'canAddWorker');
  }

  private setTabs(): void {
    const tabs = [this.tabsService.homeTab];
    this.canViewEstablishment && tabs.push(this.tabsService.workplaceTab);
    this.canViewListOfWorkers && tabs.push(this.tabsService.staffRecordsTab, this.tabsService.tAndQTab);
    tabs.push(this.tabsService.benchmarksTab, this.tabsService.workplaceUsers);

    this.tabs = tabs;
  }
}
