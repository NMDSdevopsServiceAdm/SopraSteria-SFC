import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AllRankingsResponse, BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';

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
    private pdfService: PdfService,
    private elRef: ElementRef,
    protected benchmarksService: BenchmarksService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.tilesData = this.benchmarksService.benchmarksData;
    this.rankingsData = this.benchmarksService.rankingsData;
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
    this.setDownloadBenchmarksText();
    this.checkComparisonDataExists();
    this.showRegisteredNurseSalary = this.workplace.mainService.reportingID === 1;
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
      'Benchmarks.pdf',
    );
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

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
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
