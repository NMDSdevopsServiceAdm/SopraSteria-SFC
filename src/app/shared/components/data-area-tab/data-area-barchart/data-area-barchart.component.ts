import { Component, Input, OnChanges } from '@angular/core';
import { Metric, RankingsResponse } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { DataAreaBarchartOptionsBuilder } from './data-area-barchart-options-builder';

@Component({
  selector: 'app-data-area-barchart',
  templateUrl: './data-area-barchart.component.html',
  styleUrls: ['./data-area-barchart.component.scss'],
})
export class DataAreaBarchartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() section = '';
  @Input() type: string;
  @Input() rankingsData: RankingsResponse = null;
  @Input() altDescription = '';
  public options: Highcharts.Options;
  public numberOfWorkplaces: number;
  public rank: number;
  public noPositionData: boolean;
  public noComparisonData: boolean;

  constructor(private builder: DataAreaBarchartOptionsBuilder) {}
  ngOnChanges(): void {
    this.numberOfWorkplaces = this.rankingsData.maxRank ? this.rankingsData.maxRank : null;
    this.rank = this.rankingsData.currentRank ? this.rankingsData.currentRank : null;
    this.options = this.builder.buildChartOptions(
      this.section,
      this.rankingsData,
      Metric[this.type],
      this.altDescription,
    );
  }
}
