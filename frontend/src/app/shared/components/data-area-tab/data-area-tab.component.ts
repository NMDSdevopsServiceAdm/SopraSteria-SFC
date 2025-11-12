import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AllRankingsResponse, BenchmarksResponse, MetricsContent } from '@core/model/benchmarks-v2.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';

@Component({
    selector: 'app-data-area-tab',
    templateUrl: './data-area-tab.component.html',
    styleUrls: ['./data-area-tab.component.scss'],
    standalone: false
})
export class DataAreaTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() newDashboard: boolean;
  @Input() showBanner: boolean = true;
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

  constructor(
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
    protected benchmarksService: BenchmarksV2Service,
    protected router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.tilesData = this.benchmarksService.benchmarksData.newBenchmarks;
    this.rankingsData = this.benchmarksService.rankingsData;
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.setDownloadBenchmarksText();
    this.checkComparisonDataExists();
    this.showRegisteredNurseSalary = this.workplace.mainService.reportingID === 1;
    this.breadcrumbService.show(this.getBreadcrumbsJourney());
  }

  public checkComparisonDataExists(): void {
    const noComparisonData = 'no-data';

    if (
      this.tilesData?.careWorkerPay.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.seniorCareWorkerPay.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.registeredNursePay.comparisonGroup.stateMessage === noComparisonData &&
      this.tilesData?.registeredManagerPay.comparisonGroup.stateMessage === noComparisonData
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

  public getBreadcrumbsJourney(): JourneyType {
    return this.parentSubsidiaryViewService.getViewingSubAsParent()
      ? JourneyType.SUBSIDIARY
      : JourneyType.BENCHMARKS_TAB;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
