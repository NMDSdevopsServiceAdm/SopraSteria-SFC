import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-tab',
  templateUrl: './training-and-qualifications-tab.component.html',
})
export class TrainingAndQualificationsTabComponent implements OnDestroy, OnChanges, OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];

  private subscriptions: Subscription = new Subscription();

  public trainingCategories: [];
  public totalRecords: number;
  public totalExpiredTraining: number;
  public totalExpiringTraining: number;
  public missingMandatoryTraining: number;
  public totalStaff: number;
  public isShowAllTrainings: boolean;
  public viewTrainingByCategory = false;
  public canEditWorker: boolean;

  constructor(
    private route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.view === 'categories') {
        this.viewTrainingByCategory = true;
      }
    });
    this.getAllTrainingByCategory();
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('workers' in changes) {
      this.trainingTotals();
    }
  }

  private getAllTrainingByCategory(): void {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategoriesWithTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((trainingCategories) => {
          this.trainingCategories = trainingCategories;
        }),
    );
  }

  private trainingTotals(): void {
    this.totalRecords = 0;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
    this.missingMandatoryTraining = 0;
    if (this.workers) {
      this.workers.forEach((worker: Worker) => {
        const totalTrainingRecord = worker.trainingCount;
        this.totalRecords += totalTrainingRecord + worker.qualificationCount;
        this.totalExpiredTraining += worker.expiredTrainingCount;
        this.totalExpiringTraining += worker.expiringTrainingCount;
        this.missingMandatoryTraining += worker.missingMandatoryTrainingCount;
      });
    }
  }

  public handleViewTrainingByCategory(visible: boolean) {
    this.viewTrainingByCategory = visible;
  }

  public showAllTrainings(): void {
    this.isShowAllTrainings = true;
    this.missingMandatoryTraining = 0;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }

  public mandatoryTrainingChangedHandler($event): void {
    this.missingMandatoryTraining = $event;
    this.totalExpiredTraining = 0;
    this.totalExpiringTraining = 0;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
