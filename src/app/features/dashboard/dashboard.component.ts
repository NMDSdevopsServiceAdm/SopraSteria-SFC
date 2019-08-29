import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public lastLoggedIn: string;
  public totalStaffRecords: number;
  public workplace: Establishment;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplace.uid, 'canViewEstablishment');

    if (this.workplace) {
      this.subscriptions.add(
        this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(total => (this.totalStaffRecords = total))
      );
    }

    // TODO: Use user object to get last logged in date
    this.lastLoggedIn = '';

    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }
}
