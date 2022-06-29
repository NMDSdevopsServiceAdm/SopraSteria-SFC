import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
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
  public showCQCDetailsBanner: boolean = this.establishmentService.checkCQCDetailsBanner;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private benchmarksService: BenchmarksService,
    private permissionsService: PermissionsService,
    private router: Router,
    private userService: UserService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.establishmentService.setCheckCQCDetailsBanner(false);
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    this.workplace = this.establishmentService.establishment;
    this.establishmentService.setInStaffRecruitmentFlow(false);
    this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');

    if (this.workplace && this.workplace.locationId) {
      this.subscriptions.add(
        this.establishmentService
          .getCQCRegistrationStatus(this.workplace.locationId, {
            postcode: this.workplace.postcode,
            mainService: this.workplace.mainService.name,
          })
          .subscribe((response) => {
            this.establishmentService.setCheckCQCDetailsBanner(response.cqcStatusMatch === false);
          }),
      );
    }

    this.getShowCQCDetailsBanner();
    this.showSharingPermissionsBanner = this.workplace.showSharingPermissionsBanner;

    if (this.canViewListOfWorkers) {
      this.setWorkersAndTrainingAlert();
    }

    this.totalStaffRecords = this.route.snapshot.data.totalStaffRecords;

    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();
    if (!this.canDeleteEstablishment) {
      return;
    }

    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.deleteWorkplace();
        }
      });
  }

  private setWorkersAndTrainingAlert(): void {
    const { workers = [], workerCount = 0, trainingCounts } = this.route.snapshot.data.workers;

    this.workers = workers;
    this.workerCount = workerCount;
    this.trainingCounts = trainingCounts;
    this.workerService.setWorkers(workers);
    this.trainingAlert = this.getTrainingAlertFlag(workers);
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
        },
      ),
    );
  }

  private getShowCQCDetailsBanner(): void {
    this.subscriptions.add(
      this.establishmentService.checkCQCDetailsBanner$.subscribe((showBanner) => {
        this.showCQCDetailsBanner = showBanner;
      }),
    );
  }

  /**
   * Function used to display training alert flag over the traing and qualifications tab
   * @param {workers} list of workers
   * @return {number} 0 for up-to-date, 1 for expiring soon and 2 for expired.
   */
  public getTrainingAlertFlag(workers) {
    if (workers.length > 0) {
      const expariedTrainingCount = workers.filter((worker) => worker.expiredTrainingCount > 0).length || 0;
      const expiringTrainingCount = workers.filter((worker) => worker.expiringTrainingCount > 0).length || 0;
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

  public tabClickEvent($event) {
    if ($event.tabSlug === 'benchmarks') {
      this.subscriptions.add(this.benchmarksService.postBenchmarkTabUsage(this.workplace.id).subscribe());
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
