import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
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
  @Input() isParentViewingSubsidiary = false;
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
    private benchmarksService: BenchmarksServiceBase,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.tilesData = this.benchmarksService.benchmarksData.oldBenchmarks;

    this.breadcrumbService.show(this.getBreadcrumbsJourney());
  }

  public async downloadAsPDF() {
    return await this.pdfService.BuildBenchmarksPdf(
      this.elRef,
      this.aboutData.aboutData,
      this.workplace,
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

  public getBreadcrumbsJourney(): JourneyType {
    return this.isParentViewingSubsidiary ? JourneyType.SUBSIDIARY : JourneyType.OLD_BENCHMARKS_DATA_TAB;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.removeRoutes();
  }
}
