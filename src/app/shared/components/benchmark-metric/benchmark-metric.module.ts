import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BenchmarksRoutingModule } from '@shared/components/benchmarks-tab/benchmarks-routing.module';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from './barchart/barchart.component';
import { GaugeComponent } from './gauge/gauge.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, HighchartsChartModule, BenchmarksRoutingModule],
  declarations: [GaugeComponent, BarchartComponent],
  exports: [GaugeComponent, BarchartComponent],
  providers: [],
})
export class BenchmarksMetricModule {}
