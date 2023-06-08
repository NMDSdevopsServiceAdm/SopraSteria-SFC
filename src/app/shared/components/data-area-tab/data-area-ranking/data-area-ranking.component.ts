import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

import { GaugeOptionsBuilder } from './data-area-ranking-options-builder';

@Component({
  selector: 'app-data-area-ranking',
  templateUrl: './data-area-ranking.component.html',
  styleUrls: ['./data-area-ranking.component.scss'],
})
export class DataAreaRankingComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  @Input() rankingTitle: string;
  @Input() workplaceRankNumber: number;
  @Input() workplacesNumber: number;

  public options: Highcharts.Options;

  constructor(private builder: GaugeOptionsBuilder) {}

  ngOnInit() {
    this.options = this.builder.buildChartOptions(this.workplacesNumber, this.workplaceRankNumber);
  }
}
