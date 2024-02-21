import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Establishment } from '@core/model/establishment.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-subsidiary-account',
  templateUrl: './subsidiaryAccount.component.html',
  styleUrls: ['./subsidiaryAccount.component.scss'],
})
export class SubsidiaryAccountComponent implements OnInit, OnChanges {
  @Input() dashboardView: boolean;

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

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log(this.establishmentService.primaryWorkplace);
    const { uid, id } = this.establishmentService.primaryWorkplace;
    this.workplaceUid = uid;
    this.workplaceId = id;
    this.getPermissions();
    this.setTabs();
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    this.subId = this.parentSubsidiaryViewService.getSubsidiaryUid()
      ? this.parentSubsidiaryViewService.getSubsidiaryUid()
      : this.route.snapshot.params.subsidiaryId;

    this.setWorkplace();

    console.log(this.route.snapshot.data.subsidiaryResolver);
  }

  ngOnChanges(): void {
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();
  }

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.subId, true).subscribe((workplace) => {
        this.subWorkplace = workplace;
        this.establishmentService.setState(workplace);
        this.parentWorkplaceName = this.subWorkplace?.parentName;
      }),
    );
    this.selectedTab = 'home';
  }

  public tabClickEvent(properties: { tabSlug: string }): void {
    console.log(properties.tabSlug);
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
  }

  private setTabs(): void {
    const tabs = [this.tabsService.homeTab];
    this.canViewEstablishment && tabs.push(this.tabsService.workplaceTab);
    this.canViewListOfWorkers && tabs.push(this.tabsService.staffRecordsTab, this.tabsService.tAndQTab);
    tabs.push(this.tabsService.benchmarksTab);

    this.tabs = tabs;
  }
}
