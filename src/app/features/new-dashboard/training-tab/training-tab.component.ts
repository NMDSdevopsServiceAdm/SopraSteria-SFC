import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-new-training-tab',
  templateUrl: './training-tab.component.html',
})
export class NewTrainingTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers: Worker[];
  @Input() workerCount: number;
  @Input() trainingCounts: TrainingCounts;
  @Input() tAndQsLastUpdated: string;

  private subscriptions: Subscription = new Subscription();

  public trainingCategories: TrainingRecordCategories[];
  public canEditWorker: boolean;
  public canEditEstablishment: boolean;
  // public workers = [];
  public totalTraining: number;
  public totalRecords: number;
  public totalExpiredTraining: number;
  public totalExpiringTraining: number;
  public missingMandatoryTraining: number;
  public staffMissingMandatoryTraining: number;
  public viewTrainingByCategory = false;
  public staffSortByValue = 'trainingExpired';
  public trainingSortByValue = '0_expired';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private trainingCategoryService: TrainingCategoryService,
    private tabsService: TabsService,
  ) {}

  ngOnInit(): void {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
    this.breadcrumbService.show(JourneyType.TRAINING_AND_QUALIFICATIONS_TAB);

    this.getAllTrainingByCategory();
    this.trainingTotals();
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
    this.tabsService.selectedTab = 'staff-records';
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
    this.breadcrumbService.removeRoutes();
    this.subscriptions.unsubscribe();
  }
}
