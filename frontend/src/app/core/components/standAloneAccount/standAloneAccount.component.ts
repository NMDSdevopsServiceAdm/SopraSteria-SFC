import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Tab, TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stand-alone-account',
  templateUrl: './standAloneAccount.component.html',
  styleUrls: ['./standAloneAccount.component.scss'],
})
export class StandAloneAccountComponent implements OnInit, OnDestroy {
  @Input() dashboardView: boolean;

  private subscriptions: Subscription = new Subscription();
  public workplaceUid: string;
  public workplaceId: number;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: Tab[];
  public workplaceName: string;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksServiceBase,
  ) {}

  ngOnInit(): void {
    const { uid, id, name } = this.establishmentService.primaryWorkplace;
    this.workplaceUid = uid;
    this.workplaceId = id;
    this.workplaceName = name;
    this.getPermissions();
    this.setTabs();
    this.trackChangesToWorkplaceName();
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

  private trackChangesToWorkplaceName(): void {
    this.subscriptions.add(
      this.establishmentService.primaryWorkplace$.subscribe((workplace) => {
        if (workplace) {
          this.workplaceName = workplace.name;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
