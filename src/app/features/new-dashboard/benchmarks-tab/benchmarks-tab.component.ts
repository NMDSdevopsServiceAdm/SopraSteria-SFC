import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, MetricsContent } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';

@Component({
  selector: 'app-new-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
})
export class NewBenchmarksTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public canViewFullBenchmarks: boolean;
  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public tilesData: BenchmarksResponse;

  constructor(
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
    private pdfService: PdfService,
    private elRef: ElementRef,
    private benchmarksService: BenchmarksService,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.tilesData = this.benchmarksService.benchmarksData;
    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
      'Benchmarks.pdf',
    );
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
