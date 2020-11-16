import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from './barchart/barchart.component';
import { GaugeComponent } from './gauge/gauge.component';
import { RankingContentComponent } from './ranking-content/ranking-content.component';

@NgModule({
  imports: [CommonModule, OverlayModule, HighchartsChartModule],
  declarations: [GaugeComponent, BarchartComponent, RankingContentComponent],
  exports: [GaugeComponent, BarchartComponent, RankingContentComponent],
  providers: [],
})
export class BenchmarksMetricModule {}
