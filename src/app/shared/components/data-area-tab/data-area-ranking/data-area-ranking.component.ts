import { Component, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';

import { GaugeOptionsBuilder } from './data-area-ranking-options-builder';

@Component({
  selector: 'app-data-area-ranking',
  templateUrl: './data-area-ranking.component.html',
  styleUrls: ['./data-area-ranking.component.scss'],
})
export class DataAreaRankingComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  @Input() rankingTitle: string;
  @Input() workplaceRankNumber: number;
  @Input() workplacesNumber: number;

  public noRankingData: boolean;
  public options: Highcharts.Options;
  public text: string;

  constructor(private builder: GaugeOptionsBuilder) {}

  ngOnChanges(): void {
    this.options = this.builder.buildChartOptions(this.workplacesNumber, this.workplaceRankNumber);
  }

}
