import { Component, Input, OnInit } from '@angular/core';
import { Metric, NoData, Tile } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { DataAreaBarchartOptionsBuilder } from './data-area-barchart-options-builder';

@Component({
  selector: 'app-data-area-barchart',
  templateUrl: './data-area-barchart.component.html',
  styleUrls: ['./data-area-barchart.component.scss'],
})
export class DataAreaBarchartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() section: string;
  @Input() type: string;
  @Input() data: Tile = null;
  @Input() noData: NoData;
  @Input() altDescription = '';
  @Input() pay: boolean;

  public options: Highcharts.Options;
  public numberOfWorkplaces: number;
  public rank: number;

  constructor(private builder: DataAreaBarchartOptionsBuilder) {}

  ngOnInit(): void {
    this.numberOfWorkplaces = this.data.groupRankings.maxRank;
    this.rank = this.data.groupRankings.currentRank;
    this.options = this.builder.buildChartOptions(
      this.data,
      Metric[this.type],
      // this.noData[this.data?.workplaceValue?.stateMessage],
      this.altDescription,
    );
    console.log(this.data);
  }
}
// export class DataAreaBarchartComponent {
//   @Input() positionedTitle: string;
//   @Input() payMoreThanWorkplacesNumber: number;
//   @Input() workplacesNumber: number;

//   public noPositionData: boolean;
// }
