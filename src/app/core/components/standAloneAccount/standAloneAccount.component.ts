import { Component, Input, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';

@Component({
  selector: 'app-stand-alone-account',
  templateUrl: './standAloneAccount.component.html',
  styleUrls: ['./standAloneAccount.component.scss'],
})
export class StandAloneAccountComponent implements OnInit {
  @Input() dashboardView: boolean;

  public workplaceUid: string;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public tabs: { title: string; slug: string; active: boolean }[];

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.getPermissions();
    this.getTabs();
  }

  public tabClickEvent($event: Event): void {
    console.log('tabClickEvent');
  }

  public handleTabChange($event: Event): void {
    console.log('handleTabChange');
  }

  private getPermissions(): void {
    this.canViewBenchmarks = this.permissionsService.can(this.workplaceUid, 'canViewBenchmarks') || true;
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
  }

  private getTabs(): void {
    this.tabs = [this.tabsService.homeTab];
    this.canViewEstablishment && this.tabs.push(this.tabsService.workplaceTab);
    this.canViewListOfWorkers && this.tabs.push(this.tabsService.staffRecordsTab, this.tabsService.tAndQTab);
    this.tabs.push(this.tabsService.benchmarksTab);
  }
}
