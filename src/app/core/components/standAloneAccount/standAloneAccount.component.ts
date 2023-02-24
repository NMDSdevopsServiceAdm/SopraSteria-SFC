import { Component, Input, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-stand-alone-account',
  templateUrl: './standAloneAccount.component.html',
})
export class StandAloneAccountComponent implements OnInit {
  @Input() dashboardView: boolean;

  public workplaceUid: string;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public canAddUser: boolean;

  constructor(private establishmentService: EstablishmentService, private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.getPermissions();
  }

  public tabClickEvent($event: Event): void {
    console.log('tabClickEvent');
  }

  public handleTabChange($event: Event): void {
    console.log('handleTabChange');
  }

  private getPermissions(): void {
    this.canViewBenchmarks = this.permissionsService.can(this.workplaceUid, 'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
    this.canAddUser = this.permissionsService.can(this.workplaceUid, 'canAddUser');
  }
}
