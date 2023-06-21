import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Metric, NoData, RankingsResponse, Tile } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { DataAreaBarchartOptionsBuilder } from './data-area-barchart-options-builder';

@Component({
  selector: 'app-data-area-barchart',
  templateUrl: './data-area-barchart.component.html',
  styleUrls: ['./data-area-barchart.component.scss'],
})
export class DataAreaBarchartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() section: string;
  @Input() type: string;
  // @Input() data: Tile = null;
  @Input() rankingsData: RankingsResponse;
  @Input() noData: NoData;
  @Input() altDescription = '';
  @Input() isPay: boolean;

  public options: Highcharts.Options;
  public numberOfWorkplaces: number;
  public rank: number;

  constructor(private builder: DataAreaBarchartOptionsBuilder) {}

  ngOnInit(): void {
    this.numberOfWorkplaces = this.rankingsData.maxRank;
    this.rank = this.rankingsData.currentRank;
    this.options = this.builder.buildChartOptions(
      this.rankingsData,
      Metric[this.type],
      // this.noData[this.data?.workplaceValue?.stateMessage],
      this.altDescription,
    );
    // console.log(this.rankingsData);
  }

  ngOnChanges(): void {
    this.numberOfWorkplaces = this.rankingsData.maxRank;
    this.rank = this.rankingsData.currentRank;
    this.options = this.builder.buildChartOptions(this.rankingsData, Metric[this.type], this.altDescription);
    console.log(this.rankingsData);
  }
}
// export class DataAreaBarchartComponent {
//   @Input() positionedTitle: string;
//   @Input() payMoreThanWorkplacesNumber: number;
//   @Input() workplacesNumber: number;

//   public noPositionData: boolean;
// }
