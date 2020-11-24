import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse, Metric, MetricsContent, NoData, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { GaugeComponent } from '@shared/components/benchmark-metric/gauge/gauge.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-benchmarks-rankings',
  templateUrl: './rankings.component.html',
})
export class BenchmarksRankingsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public metricContent = MetricsContent;
  public type: Metric;
  public title: string;
  public description: string;
  public noData: NoData;
  public tile: Tile = null;
  public metaDataAvailable: boolean;
  public lastUpdated: Date;
  public tilesData: BenchmarksResponse;

  @ViewChild('payGauge') payGauge: GaugeComponent;
  @ViewChild('turnoverGauge') turnoverGauge: GaugeComponent;
  @ViewChild('sicknessGauge') sicknessGauge: GaugeComponent;
  @ViewChild('qualificationsGauge') qualificationsGauge: GaugeComponent;

  constructor(
    private benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    const establishmentUid = this.establishmentService.establishment.uid;
    /*const establishmentUid = this.establishmentService.establishment.uid;

    this.benchmarksService.getRankingData(establishmentUid, Metric[this.type]);*/
    this.subscriptions.add(
      this.benchmarksService
        .getTileData(establishmentUid, ['sickness', 'turnover', 'pay', 'qualifications'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
          }
        }),
    );
  }

  /*handleRankingsResponse = (rankings: RankingsResponse): void => {
    this.gauge.load(rankings.maxRank, rankings.currentRank);
    this.currentRank = rankings.currentRank;
    this.rankStateMessage = rankings.stateMessage;
    this.rankHasValue = rankings.hasValue;
  };*/

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
