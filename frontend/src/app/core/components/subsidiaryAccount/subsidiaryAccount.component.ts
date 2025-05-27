import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Tab, TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subsidiary-account',
  templateUrl: './subsidiaryAccount.component.html',
  styleUrls: ['./subsidiaryAccount.component.scss'],
})
export class SubsidiaryAccountComponent implements OnInit, OnDestroy {
  @Input() dashboardView: boolean;
  @Input() canAddWorker = false;

  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: Tab[];
  public parentWorkplaceName: string;
  public subId: number;
  public subUid: string;
  public selectedTab: string;
  public subsidiaryWorkplace: Establishment;
  public canEditWorker: boolean;
  public hasWorkers: boolean;
  public workplaceName: string;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        if (establishment) {
          const { uid, id, name, parentName } = establishment;
          this.subUid = uid;
          this.subId = id;
          this.workplaceName = name;
          this.parentWorkplaceName = parentName;

          this.getPermissions();
          this.setTabs();
        }
      }),
    );

    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.selectedTab = selectedTab;
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
    tabs.push(this.tabsService.benchmarksTab, this.tabsService.workplaceUsersTab);

    this.tabs = tabs;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
