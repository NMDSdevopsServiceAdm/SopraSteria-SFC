import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { BenchmarksResponse, Metric, NoData, RankingsResponse, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { GaugeComponent } from '@shared/components/benchmark-metric/gauge/gauge.component';
import { RankingContent } from '@shared/components/benchmark-metric/ranking-content/ranking-content.component';
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

  public rankingContent: RankingContent;

  @ViewChild('gauge') gauge: GaugeComponent;

  constructor(
    private benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    const establishmentUid = this.establishmentService.establishment.uid;

    const dataObservable$ = this.route.data.pipe(
      tap(this.setRouteData),
      map((data) => (this.type = data.type as Metric)),
    );

    this.subscriptions.add(
      dataObservable$
        .pipe(mergeMap(() => this.benchmarksService.getTileData(establishmentUid, [Metric[this.type]])))
        .subscribe(this.handleBenchmarksResponse),
    );

    this.subscriptions.add(
      dataObservable$
        .pipe(mergeMap(() => this.benchmarksService.getRankingData(establishmentUid, Metric[this.type])))
        .subscribe(this.handleRankingsResponse),
    );
  }

  setRouteData = (data: Data): void => {
    this.breadcrumbService.show(data.journey);
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
    this.gauge.load(rankings.maxRank, rankings.currentRank);
    this.rankingContent = { ...rankings, noData: this.noData };
  };

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
