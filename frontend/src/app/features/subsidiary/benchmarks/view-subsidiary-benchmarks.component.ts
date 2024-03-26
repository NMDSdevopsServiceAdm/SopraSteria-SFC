import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AllRankingsResponse, BenchmarksResponse, MetricsContent } from '@core/model/benchmarks-v2.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { DataAreaAboutTheDataComponent } from '@shared/components/data-area-tab/about-the-data/about-the-data.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-benchmarks',
  templateUrl: './view-subsidiary-benchmarks.component.html',
  styleUrls: ['./view-subsidiary-benchmark.component.scss'],
})
export class ViewSubsidiaryBenchmarksComponent implements OnInit, OnDestroy {
  @ViewChild('aboutData') private aboutData: DataAreaAboutTheDataComponent;

  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public viewBenchmarksByCategory = false;
  public viewBenchmarksComparisonGroups = false;
  public viewBenchmarksPosition = false;
  public downloadRecruitmentBenchmarksText: string;
  public tilesData: BenchmarksResponse;
  public showRegisteredNurseSalary: boolean;
  public rankingsData: AllRankingsResponse;
  public comparisonDataExists: boolean;
  public workplace: Establishment;
  public newDashboard: boolean;
  private subsidiaryUid: string;
  public canSeeNewDataArea: boolean;
  public newDataAreaFlag: boolean;

  constructor(
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
    protected benchmarksService: BenchmarksServiceBase,
    public route: ActivatedRoute,
    private tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit(): void {
    this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;

    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.newDashboard = true;

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe((subsidiaryWorkplace) => {
      if (subsidiaryWorkplace) {
        this.workplace = subsidiaryWorkplace;
        this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
        this.subsidiaryUid = this.workplace?.uid;
        this.tilesData = this.featureFlagsService.newBenchmarksDataArea ?
            this.benchmarksService.benchmarksData.newBenchmarks
          : this.benchmarksService.benchmarksData.oldBenchmarks
        this.rankingsData = this.benchmarksService.rankingsData;
        this.canViewFullBenchmarks = this.permissionsService.can(this.subsidiaryUid, 'canViewBenchmarks');
        this.setDownloadBenchmarksText();
        this.checkComparisonDataExists();
        this.showRegisteredNurseSalary = this.workplace.mainService.reportingID === 1;
      }
    });
    this.parentSubsidiaryViewService.canShowBanner = true;
    this.parentSubsidiaryViewService.getLastUpdatedDate = this.tilesData?.meta.lastUpdated.toString();
  }

  public checkComparisonDataExists(): void {
    const noComparisonData = 'no-data';

    if (
      this.tilesData?.careWorkerPay?.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.seniorCareWorkerPay?.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.registeredNursePay?.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.registeredManagerPay?.comparisonGroup.stateMessage === noComparisonData
    ) {
      this.comparisonDataExists = false;
    } else this.comparisonDataExists = true;
  }

  public setDownloadBenchmarksText(): void {
    const fileSize = this.viewBenchmarksByCategory ? '385KB' : '430KB';
    const section = this.viewBenchmarksByCategory ? 'recruitment and retention' : 'pay';

    this.downloadRecruitmentBenchmarksText = `Download ${section} benchmarks (PDF, ${fileSize}, 2 pages)`;
  }

  public handleViewBenchmarksByCategory(visible: boolean): void {
    this.viewBenchmarksByCategory = visible;
    this.setDownloadBenchmarksText();
  }

  public handleViewComparisonGroups(visible: boolean): void {
    this.viewBenchmarksComparisonGroups = visible;
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
