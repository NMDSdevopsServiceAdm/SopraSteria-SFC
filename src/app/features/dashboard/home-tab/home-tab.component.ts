import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
})
export class HomeTabComponent implements OnInit {
  public editRole: Roles = Roles.Edit;
  public establishmentId: number;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public updateWorkplace: boolean;
  public user: UserDetails;
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.establishmentId = this.establishmentService.establishmentId;

    this.subscriptions.add(this.userService.loggedInUser$.subscribe(user => (this.user = user)));

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(workplace => (this.workplace = workplace))
    );

    this.subscriptions.add(
      this.workerService
        .getAllWorkers()
        .pipe(take(1))
        .subscribe(workers => {
          this.updateStaffRecords = !(workers.length > 0);
        })
    );
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dashboard'] });
  }
}
