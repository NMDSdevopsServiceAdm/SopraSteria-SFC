import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse, Metric, MetricsContent, NoData, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { GaugeComponent } from '@shared/components/benchmark-metric/gauge/gauge.component';
import { RankingContent } from '@shared/components/benchmark-metric/ranking-content/ranking-content.component';
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
  public rankings: AllRankingsResponse;
  public payContent: RankingContent;
  public turnoverContent: RankingContent;
  public sicknessContent: RankingContent;
  public qualificationsContent: RankingContent;

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
            if (data.meta) {
              this.metaDataAvailable = true;
              this.lastUpdated = data.meta.lastUpdated;
            }
          }
        }),
    );

    this.subscriptions.add(
      this.benchmarksService.getAllRankingData(establishmentUid).subscribe((data: AllRankingsResponse) => {
        this.rankings = data;
        this.rankings = {
          pay: {
            currentRank: 1,
            maxRank: 10,
            hasValue: true,
            stateMessage: '',
          },
          turnover: {
            currentRank: 4,
            maxRank: 12,
            hasValue: true,
            stateMessage: '',
          },
          sickness: {
            currentRank: 3,
            maxRank: 31,
            hasValue: true,
            stateMessage: '',
          },
          qualifications: {
            currentRank: 2,
            maxRank: 15,
            hasValue: true,
            stateMessage: '',
          },
        };
        this.payContent = { ...this.rankings.pay, smallText: true, noData: MetricsContent.Pay.noData };
        this.turnoverContent = { ...this.rankings.turnover, smallText: true, noData: MetricsContent.Turnover.noData };
        this.sicknessContent = { ...this.rankings.sickness, smallText: true, noData: MetricsContent.Sickness.noData };
        this.qualificationsContent = {
          ...this.rankings.qualifications,
          smallText: true,
          noData: MetricsContent.Qualifications.noData,
        };
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
