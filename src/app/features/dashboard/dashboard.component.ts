import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public canViewStaffRecords: boolean;
  public workplace: Establishment;
  public lastLoggedIn: string;
  public totalStaffRecords: number;

  constructor(
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.canViewStaffRecords = [Roles.Edit, Roles.Admin].includes(this.userService.loggedInUser.role);
    this.workplace = this.establishmentService.primaryWorkplace;

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
