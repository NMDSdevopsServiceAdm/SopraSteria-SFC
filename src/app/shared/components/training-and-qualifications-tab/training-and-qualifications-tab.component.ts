import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
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
export class TrainingAndQualificationsTabComponent implements OnDestroy, OnChanges, OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;
  @Input() trainingCounts: TrainingCounts;
  @Input() tAndQsLastUpdated: string;

  private subscriptions: Subscription = new Subscription();

  public trainingCategories: TrainingRecordCategories[];
  public totalRecords: number;
  public totalExpiredTraining: number;
  public totalExpiringTraining: number;
  public missingMandatoryTraining: number;
  public staffMissingMandatoryTraining: number;
  public totalStaff: number;
  public isShowAllTrainings: boolean;
  public viewTrainingByCategory = false;

  constructor(
    private route: ActivatedRoute,
    private workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.view === 'categories') {
        this.viewTrainingByCategory = true;
      }
    });

    this.getAllTrainingByCategory();
    this.trainingTotals();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('workers' in changes || 'trainingCounts' in changes) {
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

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    this.workerService.tabChanged.next(true);
  }

  private trainingTotals(): void {
    this.totalRecords = this.trainingCounts.totalRecords;
    this.totalExpiredTraining = this.trainingCounts.totalExpiredTraining;
    this.totalExpiringTraining = this.trainingCounts.totalExpiringTraining;
    this.missingMandatoryTraining = this.trainingCounts.missingMandatoryTraining;
    this.staffMissingMandatoryTraining = this.trainingCounts.staffMissingMandatoryTraining;
  }

  public handleViewTrainingByCategory(visible: boolean): void {
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
