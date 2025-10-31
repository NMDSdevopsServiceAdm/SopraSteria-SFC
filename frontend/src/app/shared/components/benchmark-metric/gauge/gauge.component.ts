import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

import { GaugeOptionsBuilder } from './gauge-options-builder';

@Component({
    selector: 'app-gauge',
    templateUrl: './gauge.component.html',
    styleUrls: ['./gauge.component.scss'],
    standalone: false
})
export class GaugeComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() maxRank: number;
  @Input() currentRank: number;

  public loaded = false;
  public options: Highcharts.Options;
  public emptyOptions: Highcharts.Options;

  constructor(private builder: GaugeOptionsBuilder) {}

  ngOnInit() {
    this.options = this.builder.buildChartOptions(this.maxRank, this.currentRank);
  }
}
