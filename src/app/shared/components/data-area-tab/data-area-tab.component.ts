import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AllRankingsResponse, MetricsContent } from '@core/model/benchmarks-v2.model';
import { BenchmarksResponse } from '@core/model/benchmarks-v2.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';

@Component({
  selector: 'app-data-area-tab',
  templateUrl: './data-area-tab.component.html',
  styleUrls: ['./data-area-tab.component.scss'],
})
export class DataAreaTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() newDashboard: boolean;
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
    protected benchmarksService: BenchmarksServiceBase,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.tilesData = this.benchmarksService.benchmarksData.oldBenchmarks;
    this.rankingsData = this.benchmarksService.rankingsData;
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.setDownloadBenchmarksText();
    this.checkComparisonDataExists();
    this.showRegisteredNurseSalary = this.workplace.mainService.reportingID === 1;
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

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
