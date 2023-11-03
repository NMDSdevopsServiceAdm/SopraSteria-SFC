import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-parent-account',
  templateUrl: './parentAccount.component.html',
  styleUrls: ['./parentAccount.component.scss'],
})
export class ParentAccountComponent implements OnInit, OnChanges {
  @Input() dashboardView: boolean;

  private subscriptions: Subscription = new Subscription();
  public workplaceUid: string;
  public workplaceId: number;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];
  public isSelectedWorkplace: boolean;
  public parentName: string;
  public workplace: Establishment;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const { uid, id } = this.establishmentService.primaryWorkplace;
    this.workplace = this.route.snapshot.data.establishment;
    this.workplaceUid = uid;
    this.workplaceId = id;
    this.getPermissions();
    this.setTabs();
    this.getIsSelectedWorkpace();
    this.parentName = this.establishmentService.primaryWorkplace.name;
  }

  ngOnChanges(): void {
    this.getIsSelectedWorkpace();
  }

  public getIsSelectedWorkpace(): void {
    this.isSelectedWorkplace = this.establishmentService.getIsSelectedWorkplace();
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

  public goBackToParent(): void {
    this.isSelectedWorkplace = false;
    this.getIsSelectedWorkpace();
    //this.router.navigate(['/dashboard'], { fragment: 'home' });
    this.router.navigate(['/']);
  }
}
