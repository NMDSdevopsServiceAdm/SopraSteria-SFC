import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-staff-records',
  templateUrl: './view-subsidiary-staff-records.component.html',
})
export class ViewSubsidiaryStaffRecordsComponent implements OnInit {
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

  constructor(
    // private alertService: AlertService,
    // private breadcrumbService: BreadcrumbService,
    // private dialogService: DialogService,
    // private establishmentService: EstablishmentService,
    // private benchmarksService: BenchmarksServiceBase,
    // private permissionsService: PermissionsService,
    // private router: Router,
    // private userService: UserService,
    // private workerService: WorkerService,
    // private route: ActivatedRoute,
    // private featureFlagsService: FeatureFlagsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    // this.showBanner = history.state?.showBanner;

    // this.establishmentService.setCheckCQCDetailsBanner(false);
    // this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    // this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    // this.workplace = this.establishmentService.establishment;
    // this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    // this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    // this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    // this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    // this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    // this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
  }
}
