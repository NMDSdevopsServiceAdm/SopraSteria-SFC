import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from './barchart/barchart.component';
import { GaugeComponent } from './gauge/gauge.component';

@NgModule({
  imports: [CommonModule, OverlayModule, HighchartsChartModule],
  declarations: [GaugeComponent, BarchartComponent],
  exports: [GaugeComponent, BarchartComponent],
  providers: [],
})
export class BenchmarksMetricModule {}
