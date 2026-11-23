import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-subsidiary-training-and-qualifications',
  templateUrl: './view-subsidiary-training-and-qualifications.component.html',
  standalone: false,
})
export class ViewSubsidiaryTrainingAndQualificationsComponent implements OnInit {
  public workplace: Establishment;
  public workers: Worker[];
  public workerCount: number;
  public trainingCounts: TrainingCounts;
  public tAndQsLastUpdated: string;

  private subscriptions: Subscription = new Subscription();

  public totalRecords: number;
  public canEditWorker: boolean;
  public hasTrainingCourse: boolean;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);

    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;
    this.tAndQsLastUpdated = this.route.snapshot.data.workers?.tAndQsLastUpdated;
    this.workplace = this.route.snapshot.data.establishment;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.hasTrainingCourse = this.route.snapshot.data.trainingCourses?.length > 0;

    // if returning to this page from adding multiple training and using the back link
    // we need to remove any staff that were selected
    this.trainingService.resetSelectedStaff();

    this.trainingTotals();

    this.redirectIfNotEditUser();
  }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    this.router.navigate(['dashboard'], { fragment: 'staff-records' });
  }

  private trainingTotals(): void {
    this.totalRecords = this.trainingCounts.totalRecords;
  }

  public redirectIfNotEditUser(): void {
    if (!this.canEditWorker) {
      this.router.navigate(['./workplace', this.workplace.uid, 'manage-training-and-qualification-records']);
    }
  }

  ngOnDestroy(): void {
    this.alertService.removeAlert();
    this.subscriptions.unsubscribe();
    this.breadcrumbService.removeRoutes();
  }
}
