import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
})
export class HomeTabComponent implements OnInit {
  @Input() workplace: Establishment;

  public editRole: Roles = Roles.Edit;
  public adminRole: Roles = Roles.Admin;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public updateWorkplace: boolean;
  public user: UserDetails;
  public canEdit: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private bulkUploadService: BulkUploadService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.user = this.userService.loggedInUser;
    this.canEdit = [Roles.Edit, Roles.Admin].includes(this.user.role);

    if (this.workplace && this.canEdit) {
      this.subscriptions.add(
        this.workerService
          .getAllWorkers(this.workplace.uid)
          .pipe(take(1))
          .subscribe(workers => {
            this.updateStaffRecords = !(workers.length > 0);
          })
      );
    }
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dashboard'] });
  }
}
