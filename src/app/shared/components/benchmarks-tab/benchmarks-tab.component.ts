import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksResponse, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
  styleUrls: ['./benchmarks-tab.component.scss'],
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public canViewFullBenchmarks: boolean;

  public tilesData: BenchmarksResponse;

  constructor(
    private benchmarksService: BenchmarksServiceBase,
    private elRef: ElementRef,
    private pdfService: PdfService,
    private permissionsService: PermissionsService,
    private featureFlagsService: FeatureFlagsService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.tilesData = this.featureFlagsService.newBenchmarksDataArea ? this.benchmarksService.benchmarksData.oldBenchmarks : this.benchmarksService.benchmarksData;
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

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      return await this.pdfService.BuildBenchmarksPdf(
        this.elRef,
        this.aboutData.aboutData,
        this.workplace,
        'Benchmarks.pdf',
      );
    } catch (error) {
      console.error(error);
    }
  }

  public setReturn() {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
