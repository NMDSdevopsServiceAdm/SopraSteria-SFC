import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  public canViewListOfWorkers: boolean;
  public workplace: Establishment;
  public lastLoggedIn: string;
  public totalStaffRecords: number;

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private router: Router,
    private userService: UserService,
    private workerService: WorkerService,
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');

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
