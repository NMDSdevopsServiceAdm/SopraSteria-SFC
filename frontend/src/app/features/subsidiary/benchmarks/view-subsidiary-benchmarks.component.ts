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

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe((subsidiaryWorkplace) => {
      if (subsidiaryWorkplace) {
        this.workplace = subsidiaryWorkplace;
        this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
      }
    });
    this.parentSubsidiaryViewService.canShowBanner = true;
    this.parentSubsidiaryViewService.getLastUpdatedDate = this.tilesData?.meta.lastUpdated.toString();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
