import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Metric, RankingsResponse } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { DataAreaBarchartOptionsBuilder } from './data-area-barchart-options-builder';

@Component({
  selector: 'app-data-area-barchart',
  templateUrl: './data-area-barchart.component.html',
  styleUrls: ['./data-area-barchart.component.scss'],
})
export class DataAreaBarchartComponent implements OnChanges, OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() section = '';
  @Input() type: string;
  @Input() rankingsData: RankingsResponse = null;
  @Input() altDescription = '';
  @Input() isPay: boolean;
  public options: Highcharts.Options;
  public numberOfWorkplaces: number;
  public rank: number;
  public sectionInSummary: string;
  public noPositionData: boolean;
  public noComparisonData: boolean;

  constructor(private builder: DataAreaBarchartOptionsBuilder) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.formatSection(this.type);
    this.numberOfWorkplaces = this.rankingsData.maxRank ? this.rankingsData.maxRank : null;
    this.rank = this.rankingsData.currentRank ? this.rankingsData.currentRank : null;
    this.options = this.builder.buildChartOptions(
      this.section,
      this.rankingsData,
      Metric[this.type],
      this.altDescription,
    );
  }

  public formatSection(type: string) {
    if (type === 'timeInRole') {
      return (this.sectionInSummary = 'percentage still in their main job role');
    } else {
      return (this.sectionInSummary = this.section);
    }
  }
}
