import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';
import { TrainingRecordCategories } from '@core/model/training.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-subsidiary-training-and-qualifications',
  templateUrl: './view-subsidiary-training-and-qualifications.component.html',
})
export class ViewSubsidiaryTrainingAndQualificationsComponent implements OnInit {
  public workplace: Establishment;
  public workers: Worker[];
  public workerCount: number;
  public trainingCounts: TrainingCounts;
  public tAndQsLastUpdated: string;

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
  public trainingSortByValue = '0_expired';
  public canEditWorker = true; // TODO
  public canEditEstablishment = true; // TODO

  private subsidiaryUid: string;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private route: ActivatedRoute,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private trainingCategoryService: TrainingCategoryService,
    private trainingService: TrainingService,
  ) {}

  ngOnInit(): void {
    this.establishmentService.setCheckCQCDetailsBanner(false);
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.subsidiaryUid = this.route.snapshot.params['subsidiaryUid'];

    console.log("SubsidiaryUid: ", this.subsidiaryUid);

    // this.workplace = this.route.snapshot.data.subsidiaryWorkplaceResolver;
    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;

    // log all these variables above
    console.log("Training and Qualifications: ");
    console.log("workers: ", this.workers);
    console.log("workerCount: ", this.workerCount);
    console.log("trainingCounts: ", this.trainingCounts);

    // USE RESOLVER
    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiaryWorkplace => {
      this.workplace = subsidiaryWorkplace;
    });

    const alertMessage = history.state?.alertMessage;
    alertMessage && this.showAlert(alertMessage);

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

    console.log("Subsidiary Training and Qualifications: ", this.workplace);
    console.log("Subsidiary Workers: ", this.workers);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('workers' in changes || 'trainingCounts' in changes) {
      this.trainingTotals();
    }
  }

  private showAlert(message: string): void {
    this.alertService.addAlert({
      type: 'success',
      message,
    });
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
    // this.workerService.tabChanged.next(true);
    this.router.navigate(['/subsidiary/staff-records', this.workplace.uid]);
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