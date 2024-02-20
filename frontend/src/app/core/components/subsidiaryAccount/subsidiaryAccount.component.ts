import { Component, Input, OnInit } from '@angular/core';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-subsidiary-account',
  templateUrl: './subsidiaryAccount.component.html',
  styleUrls: ['./subsidiaryAccount.component.scss'],
})
export class SubsidiaryAccountComponent implements OnInit {
  @Input() dashboardView: boolean;

  private subscriptions: Subscription = new Subscription();
  public workplaceUid: string;
  public workplaceId: number;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    const { uid, id } = this.establishmentService.primaryWorkplace;
    this.workplaceUid = uid;
    this.workplaceId = id;
    this.getPermissions();
    this.setTabs();
  }

  public tabClickEvent(properties: { tabSlug: string }): void {
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
