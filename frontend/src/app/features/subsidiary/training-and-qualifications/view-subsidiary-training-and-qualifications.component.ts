import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-view-subsidiary-training-and-qualifications',
    templateUrl: './view-subsidiary-training-and-qualifications.component.html',
    standalone: false
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
  public canEditWorker: boolean;
  public canEditEstablishment: boolean;
  public hasTrainingCourse: boolean;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private route: ActivatedRoute,
    private trainingCategoryService: TrainingCategoryService,
    private trainingService: TrainingService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);

    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;
    this.tAndQsLastUpdated = this.route.snapshot.data.workers?.tAndQsLastUpdated;
    this.workplace = this.route.snapshot.data.establishment;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
    this.hasTrainingCourse = this.route.snapshot.data.trainingCourses?.length > 0;

    this.route.queryParams?.subscribe((params) => {
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

  public getParentPermissions(): void {
    const parentUid = this.workplace.parentUid;

    this.canEditWorker = this.permissionsService.can(parentUid, 'canEditWorker');
    this.canEditEstablishment = this.permissionsService.can(parentUid, 'canEditEstablishment');
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
    this.tabsService.selectedTab = 'staff-records';
    this.router.navigate(['/subsidiary', this.workplace.uid, 'staff-records']);
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
    this.alertService.removeAlert();
    this.subscriptions.unsubscribe();
    this.breadcrumbService.removeRoutes();
  }
}
