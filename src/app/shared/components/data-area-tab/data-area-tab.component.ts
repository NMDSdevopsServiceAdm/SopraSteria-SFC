import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { DataAreaAboutTheDataComponent } from './about-the-data/about-the-data.component';

const PAY_FIELDS = ['careWorkerPay', 'seniorCareWorkerPay', 'registeredNursePay', 'registeredManagerPay'];
const RECRUITMENT_AND_RETENTION_FIELDS = ['vacancyRate', 'turnoverRate', 'timeInRole'];

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
  public downloadPayBenchmarksText = 'Download pay benchmarks';
  public downloadRecruitmentBenchmarksText = 'Download recruitment and retention benchmarks';
  public tilesData: BenchmarksResponse;
  public payComparisonData: boolean;
  public rAndRComparisonData: boolean;

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
    console.log(this.tilesData);
    this.payComparisonData = this.comparisonDataCheck(PAY_FIELDS);
    this.rAndRComparisonData = this.comparisonDataCheck(RECRUITMENT_AND_RETENTION_FIELDS);
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
    this.setDownloadBenchmarksText();
  }

  private comparisonDataCheck(fields: string[]): boolean {
    const result = fields.forEach((field) => {
      this.tilesData[field];
      console.log(this.tilesData[field]);
    });
    return false;
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
      'Benchmarks.pdf',
    );
  }

  public setDownloadBenchmarksText(): void {
    const pagesPay = '2';
    const fileSizePay = '430KB';
    const pagesRecruitment = '2';
    const fileSizeRecruitment = '385KB';
    this.downloadPayBenchmarksText = `${this.downloadPayBenchmarksText} (PDF, ${fileSizePay}, ${pagesPay} pages)`;
    this.downloadRecruitmentBenchmarksText = `${this.downloadRecruitmentBenchmarksText} (PDF, ${fileSizeRecruitment}, ${pagesRecruitment} pages)`;
  }

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }

  public handleViewBenchmarksByCategory(visible: boolean): void {
    this.viewBenchmarksByCategory = visible;
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
