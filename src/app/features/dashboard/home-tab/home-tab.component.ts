import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
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

  private subscriptions: Subscription = new Subscription();
  public adminRole: Roles = Roles.Admin;
  public canBulkUpload: boolean;
  public canEdit: boolean;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public user: UserDetails;

  constructor(
    private bulkUploadService: BulkUploadService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.user = this.userService.loggedInUser;
    this.canEdit = [Roles.Edit, Roles.Admin].includes(this.user.role);
    this.canBulkUpload = this.permissionsService.can(this.workplace.uid, 'canBulkUpload');

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
