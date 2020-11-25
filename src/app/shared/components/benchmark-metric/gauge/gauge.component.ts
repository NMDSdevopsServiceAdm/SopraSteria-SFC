import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GaugeOptionsBuilder } from './gauge-options-builder';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
})
export class GaugeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  public loaded = false;
  public options: Highcharts.Options;
  public emptyOptions: Highcharts.Options;

  constructor(private builder: GaugeOptionsBuilder) {}

  ngOnInit() {
    this.emptyOptions = this.builder.buildEmptyChartOptions();
  }

  load(maxRank: number, currentRank: number) {
    this.options = this.builder.buildChartOptions(maxRank, currentRank);
    this.loaded = true;
  }
}
