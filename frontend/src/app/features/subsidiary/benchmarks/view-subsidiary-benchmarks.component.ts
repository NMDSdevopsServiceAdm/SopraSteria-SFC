import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, Meta, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-benchmarks',
  templateUrl: './view-subsidiary-benchmarks.component.html',
})
export class ViewSubsidiaryBenchmarksComponent implements OnInit {
  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;
  @Output() downloadPDF = new EventEmitter();

  public primaryEstablishment: Establishment;
  public subsidiaryWorkplace: Establishment;
  public summaryReturnUrl: URLStructure;
  public canDeleteEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public meta: Meta;
  public workplaceID: string;
  public totalStaffRecords: number;
  public trainingAlert: number;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;
  private showBanner = false;
  public newDataAreaFlag: boolean;
  public canSeeNewDataArea: boolean;
  public subsidiaryBenchmark: Establishment;
  public tilesData: BenchmarksResponse;
  protected router: Router;
  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  constructor(
    // private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    // private dialogService: DialogService,
    // private establishmentService: EstablishmentService,
    private benchmarksService: BenchmarksServiceBase,
    private permissionsService: PermissionsService,
    // private router: Router,
    // private userService: UserService,
    // private workerService: WorkerService,
    // private route: ActivatedRoute,
    // private featureFlagsService: FeatureFlagsService,
    private tabsService: TabsService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private featureFlagService: FeatureFlagsService,
    private pdfService: PdfService,
    private elRef: ElementRef,
  ) {}

  ngOnInit(): void {
    // this.showBanner = history.state?.showBanner;





    // this.establishmentService.setCheckCQCDetailsBanner(false);
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiary => {
      this.subsidiaryWorkplace = subsidiary;
      this.workplaceID = this.subsidiaryWorkplace.uid;
      this.canViewBenchmarks = this.permissionsService.can(this.subsidiaryWorkplace.uid, 'canViewBenchmarks');
      this.canViewFullBenchmarks = this.permissionsService.can(this.subsidiaryWorkplace.uid, 'canViewBenchmarks');
      this.tilesData = this.featureFlagService.newBenchmarksDataArea
      ? this.benchmarksService.benchmarksData.oldBenchmarks
      : this.benchmarksService.benchmarksData;
    });

    // this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    // this.workplace = this.establishmentService.establishment;

    // this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    // this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    // this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    // this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    // this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);


  }


  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.subsidiaryWorkplace,
      'Benchmarks.pdf',
    );
  }

  get payTile(): Tile {
    return this.tilesData?.pay;
  }


  get turnoverTile(): Tile {
    return this.tilesData?.turnover;
  }

  get sicknessTile(): Tile {
    return this.tilesData?.sickness;
  }

  get qualificationsTile(): Tile {
    return this.tilesData?.qualifications;
  }


  public setReturn() {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }

}
