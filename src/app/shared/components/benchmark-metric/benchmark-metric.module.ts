import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from './barchart/barchart.component';
import { MetricDescDirective } from './barchart/barchart.component';
import { GaugeComponent } from './gauge/gauge.component';
import { YourRankDirective } from './gauge/gauge.component';

@NgModule({
  imports: [OverlayModule, HighchartsChartModule],
  declarations: [GaugeComponent, MetricDescDirective, BarchartComponent, YourRankDirective],
  exports: [GaugeComponent, BarchartComponent],
  providers: [],
})
export class BenchmarksMetricModule {}
