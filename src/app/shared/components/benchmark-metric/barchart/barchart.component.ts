import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Metric, Tile } from '@core/model/benchmarks.model';
import * as Highcharts from 'highcharts';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BarchartOptionsBuilder } from './barchart-options-builder';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
})
export class BarchartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() benchmarks: Tile = null;
  @Input() altDescription: string = '';
  @Input() noData: string = '';
  @Input() type: Metric;

  loaded: boolean = false;

  public options: Highcharts.Options;
  public emptyChartOptions: Highcharts.Options;

  constructor(private builder: BarchartOptionsBuilder) {}

  ngOnInit() {
    if (this.benchmarks) {
      this.options = this.builder.buildChartOptions(this.benchmarks, this.type, this.noData, this.altDescription);
      this.loaded = true;
    } else {
      this.emptyChartOptions = this.builder.buildEmptyChartOptions(this.altDescription);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('benchmarks') && this.benchmarks) {
      this.options = this.builder.buildChartOptions(this.benchmarks, this.type, this.noData, this.altDescription);
      this.loaded = true;
    }
  }
}
