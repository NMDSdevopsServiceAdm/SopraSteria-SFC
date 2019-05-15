import { AuthService } from '@core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WorkerService } from '@core/services/worker.service';
import { LoggedInSession } from '@core/model/logged-in.model';
import { Roles } from '@core/model/roles.enum';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
})
export class HomeTabComponent implements OnInit {
  private editRole: Roles = Roles.Edit;
  private role: Roles;
  private subscriptions: Subscription = new Subscription();
  public updateStaffRecords: boolean;
  public updateWorkplace: boolean;

  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.authService.auth$
        .pipe(take(1))
        .subscribe((loggedInSession: LoggedInSession) => (this.role = loggedInSession.role))
    );

    this.subscriptions.add(
      this.workerService
        .getAllWorkers()
        .pipe(take(1))
        .subscribe(workers => {
          this.updateStaffRecords = !(workers.length > 0);
        })
    );

    this.subscriptions.add(
      this.establishmentService
        .getEmployerType()
        .pipe(take(1))
        .subscribe(d => {
          this.updateWorkplace = !d.employerType;
        })
    );
  }
}
