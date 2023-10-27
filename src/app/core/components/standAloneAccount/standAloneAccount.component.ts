import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, DoCheck } from '@angular/core';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stand-alone-account',
  templateUrl: './standAloneAccount.component.html',
  styleUrls: ['./standAloneAccount.component.scss'],
})
export class StandAloneAccountComponent implements OnInit, OnChanges, DoCheck {
  @Input() dashboardView: boolean;

  private subscriptions: Subscription = new Subscription();
  public workplaceUid: string;
  public workplaceId: number;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];
  public primaryWorkplaceName: string;
  public isSelectedWorkplace: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private benchmarksService: BenchmarksService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const { uid, id, name, isParent } = this.establishmentService.primaryWorkplace;
    this.workplaceUid = uid;
    this.workplaceId = id;
    this.getPermissions();
    this.setTabs();
    this.primaryWorkplaceName = isParent ? name : null;
    this.getIsSelectedWorkpace();
  }

  ngOnChanges(): void {
    this.getIsSelectedWorkpace();
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

  public getIsSelectedWorkpace(): void {
    this.isSelectedWorkplace = this.establishmentService.getIsSelectedWorkplace();
  }

  ngDoCheck(): void {
    if (this.isSelectedWorkplace === false) {
      this.cd.detectChanges();
    }
  }

  public goBackToParent(): void {
    this.isSelectedWorkplace = false;
    this.getIsSelectedWorkpace();
    this.cd.detectChanges();
    //this.router.navigate(['/dashboard'], { fragment: 'home' });
    this.router.navigate(['/']);
  }
}
