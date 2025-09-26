import { Component, Input, OnInit } from '@angular/core';
import { Metric, NoData, Tile } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { BarchartOptionsBuilder } from './barchart-options-builder';

@Component({
    selector: 'app-barchart',
    templateUrl: './barchart.component.html',
    styleUrls: ['./barchart.component.scss'],
    standalone: false
})
export class BarchartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() tile: Tile = null;
  @Input() altDescription = '';
  @Input() noData: NoData;
  @Input() type: Metric;

  loaded = false;

  public options: Highcharts.Options;
  public emptyChartOptions: Highcharts.Options;

  constructor(private builder: BarchartOptionsBuilder) {}

  ngOnInit() {
    this.options = this.builder.buildChartOptions(
      this.tile,
      this.type,
      this.noData[this.tile?.workplaceValue?.stateMessage],
      this.altDescription,
    );
    this.loaded = true;
  }
}
