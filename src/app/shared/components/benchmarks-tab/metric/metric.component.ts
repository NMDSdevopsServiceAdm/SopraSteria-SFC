import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { BenchmarksResponse, Metric, NoData, RankingsResponse, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfService } from '@core/services/pdf.service';
import { GaugeComponent } from '@shared/components/benchmark-metric/gauge/gauge.component';
import { RankingContent } from '@shared/components/benchmark-metric/ranking-content/ranking-content.component';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { jsPDF } from 'jspdf';
import { Subscription } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-benchmarks-metric',
  templateUrl: './metric.component.html',
})
export class BenchmarksMetricComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public type: Metric;
  public title: string;
  public description: string;
  public noData: NoData;
  public tile: Tile = null;
  public metaDataAvailable: boolean;
  public numberOfStaff: number;
  public numberOfWorkplaces: number;
  public lastUpdated: Date;
  public workplace: Establishment;
  public currentRank: number;
  public rankStateMessage: string;
  public rankHasValue: boolean;
  public establishmentUid: string;
  public primaryWorkplaceUid: string;
  public journeyType: string;

  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;
  @ViewChild('gauge') gauge: GaugeComponent;

  public rankings: RankingsResponse;
  public rankingContent: RankingContent;

  constructor(
    private benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private pdfService: PdfService,
    private elRef: ElementRef,
  ) {}

  get metric(): string {
    return Metric[this.type];
  }

  ngOnInit(): void {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.workplace = this.establishmentService.establishment;
    this.establishmentUid = this.workplace.uid;

    const dataObservable$ = this.route.data.pipe(
      tap(this.setRouteData),
      map((data) => (this.type = data.type as Metric)),
    );

    this.subscriptions.add(
      dataObservable$
        .pipe(mergeMap(() => this.benchmarksService.getTileData(this.establishmentUid, [Metric[this.type]])))
        .subscribe(this.handleBenchmarksResponse),
    );

    this.subscriptions.add(
      dataObservable$
        .pipe(mergeMap(() => this.benchmarksService.getRankingData(this.establishmentUid, Metric[this.type])))
        .subscribe(this.handleRankingsResponse),
    );
  }

  setRouteData = (data: Data): void => {
    this.calculateJourneyType();
    this.breadcrumbService.show(data.journey[this.journeyType]);
    this.title = data.title;
    this.description = data.description;
    this.noData = data.noData;
  };

  handleBenchmarksResponse = (benchmarks: BenchmarksResponse): void => {
    this.tile = benchmarks[Metric[this.type]];
    this.metaDataAvailable = Boolean(benchmarks.meta && this.tile.workplaces && this.tile.staff);
    if (this.metaDataAvailable) {
      this.numberOfWorkplaces = this.tile.workplaces;
      this.numberOfStaff = this.tile.staff;
      this.lastUpdated = benchmarks.meta.lastUpdated;
    }
  };

  handleRankingsResponse = (rankings: RankingsResponse): void => {
    this.rankings = rankings;
    this.rankingContent = { ...this.rankings, noData: this.noData };
  };
  public async downloadAsPDF($event: Event): Promise<jsPDF> {
    $event.preventDefault();

    try {
      return await this.pdfService.BuildMetricsPdf(this.elRef, this.workplace, `${Metric[this.type]}.pdf`);
    } catch (error) {
      console.error(error);
    }
  }

  public calculateJourneyType(): void {
    this.journeyType = this.primaryWorkplaceUid === this.establishmentUid ? 'dashboard' : 'workplace';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
