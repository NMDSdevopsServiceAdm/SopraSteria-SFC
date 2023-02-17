import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
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
  public totalTraining: number;
  public totalRecords: number;
  public totalExpiredTraining: number;
  public totalExpiringTraining: number;
  public missingMandatoryTraining: number;
  public staffMissingMandatoryTraining: number;
  public totalStaff: number;
  public isShowAllTrainings: boolean;
  public viewTrainingByCategory = false;
  public staffSortByValue = 'trainingExpired';
  public trainingSortByValue = 'trainingExpired';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
    private trainingService: TrainingService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.view === 'categories') {
        this.viewTrainingByCategory = true;
      }
    });

    // if returning to this page from adding multiple training and using the back link
    // we need to remove any staff that were selected
    this.trainingService.resetSelectedStaff();

    this.getAllTrainingByCategory();
    this.trainingTotals();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('workers' in changes || 'trainingCounts' in changes) {
      this.trainingTotals();
    }
  }

  public navigateToMultipleTraining(): void {
    this.router.navigate(['/workplace', this.workplace.uid, 'add-multiple-training', 'select-staff']);
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
    this.totalTraining = this.trainingCounts.totalTraining;
    this.totalRecords = this.trainingCounts.totalRecords;
    this.totalExpiredTraining = this.trainingCounts.totalExpiredTraining;
    this.totalExpiringTraining = this.trainingCounts.totalExpiringTraining;
    this.missingMandatoryTraining = this.trainingCounts.missingMandatoryTraining;
    this.staffMissingMandatoryTraining = this.trainingCounts.staffMissingMandatoryTraining;
  }

  public handleViewTrainingByCategory(visible: boolean): void {
    this.viewTrainingByCategory = visible;
  }

  public updateSortByValue(properties: { section: string; sortByValue: string }): void {
    const { section, sortByValue } = properties;
    section === 'staff-summary' ? (this.staffSortByValue = sortByValue) : (this.trainingSortByValue = sortByValue);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
