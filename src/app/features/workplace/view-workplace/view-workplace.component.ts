import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
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
  public canDeleteEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public totalStaffRecords: number;
  private subscriptions: Subscription = new Subscription();
  public trainingAlert: number;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private router: Router,
    private userService: UserService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    this.workplace = this.establishmentService.establishment;

    this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid,'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    this.subscriptions.add(this.permissionsService.getPermissions(this.workplace.uid).subscribe(
      permission => {
        this.canViewBenchmarks = permission.permissions.canViewBenchmarks
      }
    ));
    if (this.canViewListOfWorkers) {
      this.subscriptions.add(
        this.workerService.getAllWorkers(this.workplace.uid).subscribe(
          workers => {
            this.workerService.setWorkers(workers);
            this.trainingAlert = this.getTrainingAlertFlag(workers);
          },
          error => {
            console.error(error.error);
          }
        )
      );
    }

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
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();
    if (!this.canDeleteEstablishment) {
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
    if (!this.canDeleteEstablishment) {
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

  /**
   * Function used to display training alert flag over the traing and qualifications tab
   * @param {workers} list of workers
   * @return {number} 0 for up-to-date, 1 for expiring soon and 2 for expired.
   */
  public getTrainingAlertFlag(workers) {
    if (workers.length > 0) {
      const expariedTrainingCount = workers.filter(worker => worker.expiredTrainingCount > 0).length || 0;
      const expiringTrainingCount = workers.filter(worker => worker.expiringTrainingCount > 0).length || 0;
      if (expariedTrainingCount > 0) {
        return 2;
      } else if (expiringTrainingCount > 0) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
