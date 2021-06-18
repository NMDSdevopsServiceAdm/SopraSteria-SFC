import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AllRankingsResponse, BenchmarksResponse, Metric, MetricsContent, NoData, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public establishmentUid: string;
  public primaryWorkplaceUid: string;
  public journey: {
    dashboard: JourneyType;
    workplace: JourneyType;
  };
  public journeyType: string;

  constructor(
    private benchmarksService: BenchmarksService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.establishmentUid = this.establishmentService.establishment.uid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;

    this.route.fragment.subscribe((fragment: string) => {
      switch (Metric[fragment]) {
        case Metric.pay: {
          this.journey = {
            dashboard: JourneyType.BENCHMARKS_PAY,
            workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_PAY,
          };
          break;
        }
        case Metric.turnover: {
          this.journey = {
            dashboard: JourneyType.BENCHMARKS_TURNOVER,
            workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_TURNOVER,
          };
          break;
        }
        case Metric.sickness: {
          this.journey = {
            dashboard: JourneyType.BENCHMARKS_SICKNESS,
            workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_SICKNESS,
          };
          break;
        }
        case Metric.qualifications: {
          this.journey = {
            dashboard: JourneyType.BENCHMARKS_QUALIFICATIONS,
            workplace: JourneyType.BENCHMARKS_SUBSIDIARIES_QUALIFICATIONS,
          };
          break;
        }
      }
    });

    this.calculateJourneyType();
    this.breadcrumbService.show(this.journey[this.journeyType]);
    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.establishmentUid, ['sickness', 'turnover', 'pay', 'qualifications'])
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
      this.benchmarksService.getAllRankingData(this.establishmentUid).subscribe((data: AllRankingsResponse) => {
        this.rankings = data;
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public calculateJourneyType(): void {
    this.journeyType = this.primaryWorkplaceUid === this.establishmentUid ? 'dashboard' : 'workplace';
  }
}
