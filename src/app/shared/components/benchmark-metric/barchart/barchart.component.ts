import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Metric, NoData, Tile } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';

import { BarchartOptionsBuilder } from './barchart-options-builder';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
})
export class BarchartComponent implements OnInit, OnChanges {
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
    if (this.tile) {
      this.setOptions();
    } else {
      this.emptyChartOptions = this.builder.buildEmptyChartOptions(this.altDescription);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('tile') && this.tile) {
      this.setOptions();
    }
  }

  private setOptions() {
    this.options = this.builder.buildChartOptions(
      this.tile,
      this.type,
      this.noData[this.tile.workplaceValue?.stateMessage],
      this.altDescription,
    );
    this.loaded = true;
  }
}
