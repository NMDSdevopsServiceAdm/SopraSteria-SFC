import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-tab',
  templateUrl: './training-and-qualifications-tab.component.html',
})
export class TrainingAndQualificationsTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public workers: Worker[];

  public trainingCategories: [];
  public totalRecords;
  public totalExpiredTraining;
  public totalExpiringTraining;
  public missingMandatoryTraining;
  public totalStaff: number;
  public isShowAllTrainings: boolean;

  public viewTrainingByCategory = false;

  constructor(
    private workerService: WorkerService,
    private route: ActivatedRoute,

    protected establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.view === 'categories') {
        this.viewTrainingByCategory = true;
      }
    });
    this.getAllWorkers();
    this.getAllTrainingByCategory();
  }

  getAllTrainingByCategory() {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategoriesWithTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((trainingCategories) => {
          this.trainingCategories = trainingCategories;
        }),
    );
  }

  getAllWorkers() {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        (workers) => {
          this.workers = workers;
          this.totalRecords = 0;
          this.totalExpiredTraining = 0;
          this.totalExpiringTraining = 0;
          this.missingMandatoryTraining = 0;
          this.workers.forEach((worker: Worker) => {
            const totalTrainingRecord = worker.trainingCount;
            this.totalRecords += totalTrainingRecord + worker.qualificationCount;
            this.totalExpiredTraining += worker.expiredTrainingCount;
            this.totalExpiringTraining += worker.expiringTrainingCount;
            this.missingMandatoryTraining += worker.missingMandatoryTrainingCount;
          });
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  public handleViewTrainingByCategory(visible: boolean) {
    this.viewTrainingByCategory = visible;
  }

  public showAllTrainings() {
    this.isShowAllTrainings = true;
    this.missingMandatoryTraining = 0;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }

  public mandatoryTrainingChangedHandler($event) {
    this.missingMandatoryTraining = $event;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
