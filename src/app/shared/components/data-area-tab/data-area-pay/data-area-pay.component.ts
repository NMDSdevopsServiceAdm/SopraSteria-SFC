import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { DataAreaAboutTheDataComponent } from '../about-the-data/about-the-data.component';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() newDashboard: boolean;
  @ViewChild('aboutData') private aboutData: DataAreaAboutTheDataComponent;

  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public viewBenchmarksComparisonGroups = false;
  public viewBenchmarksPosition = false;
  public downloadPayBenchmarksText = 'Download pay benchmarks';
  public tilesData: BenchmarksResponse;

  constructor(
    private permissionsService: PermissionsService,
    private pdfService: PdfService,
    private elRef: ElementRef,
    protected benchmarksService: BenchmarksService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.tilesData = this.benchmarksService.benchmarksData;
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.setDownloadBenchmarksText();
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
  }

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }

  public handleViewComparisonGroups(visible: boolean): void {
    this.viewBenchmarksComparisonGroups = visible;
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }
}
