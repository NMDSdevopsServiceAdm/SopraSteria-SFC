import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-view-subsidiary-training-and-qualifications',
  templateUrl: './view-subsidiary-training-and-qualifications.component.html',
})
export class ViewSubsidiaryTrainingAndQualificationsComponent implements OnInit {
  public primaryEstablishment: Establishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
  public canDeleteEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public totalStaffRecords: number;
  public trainingAlert: number;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;
  private showBanner = false;
  public newDataAreaFlag: boolean;
  public canSeeNewDataArea: boolean;
  private subsidiaryUid: string;

  constructor(
    // private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    // private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    // private benchmarksService: BenchmarksServiceBase,
    private permissionsService: PermissionsService,
    private router: Router,
    // private userService: UserService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private featureFlagsService: FeatureFlagsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.showBanner = history.state?.showBanner;
    this.establishmentService.setCheckCQCDetailsBanner(false);
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.subsidiaryUid = this.route.snapshot.params['subsidiaryUid'];

    console.log("SubsidiaryUid: ", this.subsidiaryUid);

    this.workplace = this.route.snapshot.data.subsidiaryWorkplaceResolver;
    // this.workers = this.route.snapshot.data.subsidiaryWorkersResolver.workers;

    this.workerService.getAllWorkers(this.subsidiaryUid).subscribe({
      next: (workers) => {
        console.log(workers.workerCount);
        this.workers = workers.workers;
      },
      error: (err: any) => { console.log("Subsidiary workers retrieval error: ", err); },
    });

    // USE RESOLVER
    // this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiaryWorkplace => {
    //   this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    //   this.workplace = subsidiaryWorkplace;
    //   this.workerService.getAllWorkers(this.subsidiaryUid).subscribe({
    //     next: (workers) => {
    //       console.log(workers.workerCount);
    //       this.workers = workers.workers;
    //     },
    //     error: (err: any) => { console.log("Subsidiary workers retrieval error: ", err); },
    //   });
    // });

    console.log("Subsidiary Training and Qualifications: ", this.workplace);
    console.log("Subsidiary Workers: ", this.workers);

    this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
  }

  // public ngOnChanges(changes: SimpleChanges): void {
  //   if ('workers' in changes || 'trainingCounts' in changes) {
  //     this.trainingTotals();
  //   }
  // }

  // private showAlert(message: string): void {
  //   this.alertService.addAlert({
  //     type: 'success',
  //     message,
  //   });
  // }

  // public navigateToMultipleTraining(): void {
  //   this.router.navigate(['/workplace', this.workplace.uid, 'add-multiple-training', 'select-staff']);
  // }

  // private getAllTrainingByCategory(): void {
  //   this.subscriptions.add(
  //     this.trainingCategoryService
  //       .getCategoriesWithTraining(this.workplace.id)
  //       .pipe(take(1))
  //       .subscribe((trainingCategories) => {
  //         this.trainingCategories = trainingCategories;
  //       }),
  //   );
  // }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    // this.workerService.tabChanged.next(true);
    this.router.navigate(['/subsidiary/staff-records', this.workplace.uid]);
  }

  // private trainingTotals(): void {
  //   this.totalTraining = this.trainingCounts.totalTraining;
  //   this.totalRecords = this.trainingCounts.totalRecords;
  //   this.totalExpiredTraining = this.trainingCounts.totalExpiredTraining;
  //   this.totalExpiringTraining = this.trainingCounts.totalExpiringTraining;
  //   this.missingMandatoryTraining = this.trainingCounts.missingMandatoryTraining;
  //   this.staffMissingMandatoryTraining = this.trainingCounts.staffMissingMandatoryTraining;
  // }

  // public handleViewTrainingByCategory(visible: boolean): void {
  //   this.viewTrainingByCategory = visible;
  // }

  // public updateSortByValue(properties: { section: string; sortByValue: string }): void {
  //   const { section, sortByValue } = properties;
  //   section === 'staff-summary' ? (this.staffSortByValue = sortByValue) : (this.trainingSortByValue = sortByValue);
  // }

  // ngOnDestroy(): void {
  //   this.subscriptions.unsubscribe();
  // }
}
