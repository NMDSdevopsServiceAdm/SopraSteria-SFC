import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
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
export class SubsidiaryAccountComponent implements OnInit {
  @Input() dashboardView: boolean;
  @Input() canAddWorker = false;

  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];
  public parentWorkplaceName: string;
  public subId: number;
  public subUid: string;
  public selectedTab: string;
  public subsidiaryWorkplace: Establishment;
  public canEditWorker: boolean;
  public hasWorkers: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.subUid = this.parentSubsidiaryViewService.getSubsidiaryUid();
    this.setWorkplace();

    this.getPermissions();
    this.setTabs();

    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.selectedTab = selectedTab;
      }),
    );
  }

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.subUid, true).subscribe((workplace) => {
        this.establishmentService.setState(workplace);
        this.subId = workplace.id;
        this.parentWorkplaceName = workplace.parentName;
      }),
    );
  }

  public tabClickEvent(properties: { tabSlug: string }): void {
    this.selectedTab = properties.tabSlug;

    if (properties.tabSlug === 'benchmarks') {
      this.subscriptions.add(this.benchmarksService.postBenchmarkTabUsage(this.subId).subscribe());
    }
  }

  private getPermissions(): void {
    this.canViewBenchmarks = this.permissionsService.can(this.subUid, 'canViewBenchmarks') || true;
    this.canViewListOfUsers = this.permissionsService.can(this.subUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.subUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.subUid, 'canViewEstablishment');
    this.canEditWorker = this.permissionsService.can(this.subUid, 'canEditWorker');
    this.canAddWorker = this.permissionsService.can(this.subUid, 'canAddWorker');
  }

  private setTabs(): void {
    const tabs = [this.tabsService.homeTab];
    this.canViewEstablishment && tabs.push(this.tabsService.workplaceTab);
    this.canViewListOfWorkers && tabs.push(this.tabsService.staffRecordsTab, this.tabsService.tAndQTab);
    tabs.push(this.tabsService.benchmarksTab, this.tabsService.workplaceUsers);

    this.tabs = tabs;
  }
}
