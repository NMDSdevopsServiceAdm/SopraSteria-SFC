import { Component, OnInit } from '@angular/core';
import { LoggedInSession } from '@core/model/logged-in.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
})
export class HomeTabComponent implements OnInit {
  public editRole: Roles = Roles.Edit;
  public role: Roles;
  public establishmentId: number;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public updateWorkplace: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.establishmentId = this.establishmentService.establishmentId;

    this.subscriptions.add(
      this.authService.auth$.pipe(take(1)).subscribe((loggedInSession: LoggedInSession) => {
        this.role = loggedInSession.role;
        this.isParent = loggedInSession.establishment.isParent;
      })
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

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dashboard'] });
  }
}
