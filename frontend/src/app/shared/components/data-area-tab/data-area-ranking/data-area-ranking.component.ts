import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

import { GaugeOptionsBuilder } from './data-area-ranking-options-builder';

@Component({
    selector: 'app-data-area-ranking',
    templateUrl: './data-area-ranking.component.html',
    styleUrls: ['./data-area-ranking.component.scss'],
    standalone: false
})
export class DataAreaRankingComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  @Input() rankingTitle: string;
  @Input() workplaceRankNumber: number;
  @Input() workplacesNumber: number;
  @Input() noWorkplaceData = false;
  @Input() isPay: boolean;
  @Input() type: string;

  public noRankingData: boolean;
  public options: Highcharts.Options;
  public text: string;

  constructor(private builder: GaugeOptionsBuilder) {}

  ngOnInit() {
    this.options = this.builder.buildChartOptions(this.workplacesNumber, this.workplaceRankNumber);
  }

  ngOnChanges(): void {
    this.options = this.builder.buildChartOptions(this.workplacesNumber, this.workplaceRankNumber);
  }
}
