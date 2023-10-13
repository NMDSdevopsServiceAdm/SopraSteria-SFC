import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BenchmarksResponse, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { IBenchmarksService } from '@core/services/Ibenchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
})
export class NewBenchmarksTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;
  private subscriptions: Subscription = new Subscription();
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
    private benchmarksService: IBenchmarksService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.tilesData = this.benchmarksService.benchmarksData;

    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
          }
        }),
    );
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
