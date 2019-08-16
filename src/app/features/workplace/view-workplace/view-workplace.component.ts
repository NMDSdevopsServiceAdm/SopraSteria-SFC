import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import {
  DeleteWorkplaceDialogComponent,
} from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-workplace',
  templateUrl: './view-workplace.component.html',
})
export class ViewWorkplaceComponent implements OnInit, OnDestroy {
  public primaryEstablishment: Establishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
  public staffPermission = DataPermissions.WorkplaceAndStaff;
  public canDelete: boolean;
  public canViewStaffRecords: boolean;
  public totalStaffRecords: number;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private alertService: AlertService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private workerService: WorkerService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    this.workplace = this.establishmentService.establishment;

    this.subscriptions.add(
      this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(total => (this.totalStaffRecords = total))
    );

    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };

    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid],
    });

    this.canViewStaffRecords =
      [Roles.Edit, Roles.Admin].includes(this.userService.loggedInUser.role) &&
      ((this.workplace.dataOwner === WorkplaceDataOwner.Parent && this.primaryEstablishment.isParent) ||
        (this.workplace.dataOwner === WorkplaceDataOwner.Workplace && !this.primaryEstablishment.isParent) ||
        (this.workplace.dataOwner === WorkplaceDataOwner.Workplace &&
          this.primaryEstablishment.isParent &&
          this.workplace.dataPermissions === DataPermissions.WorkplaceAndStaff));
    this.canDelete =
      this.primaryEstablishment.isParent && [Roles.Edit, Roles.Admin].includes(this.userService.loggedInUser.role);
  }

  public checkPermission(permission: DataPermissions) {
    return this.workplace.parentPermissions === permission;
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();
    if (!this.canDelete) {
      return;
    }

    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe(deleteConfirmed => {
        if (deleteConfirmed) {
          this.deleteWorkplace();
        }
      });
  }

  private deleteWorkplace(): void {
    if (!this.canDelete) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.deleteWorkplace(this.workplace.uid).subscribe(
        () => {
          this.router.navigate(['workplace/view-all-workplaces']).then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: `${this.workplace.name} has been permanently deleted.`,
            });
          });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
