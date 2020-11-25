import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormatMoneyPipe } from '@shared/pipes/format-money.pipe';
import { FormatPercentPipe } from '@shared/pipes/format-percent.pipe';
import { SharedModule } from '@shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';

import { BarchartComponent } from '../benchmark-metric/barchart/barchart.component';
import { GaugeComponent } from '../benchmark-metric/gauge/gauge.component';
import { RankingContentComponent } from '../benchmark-metric/ranking-content/ranking-content.component';
import { BenchmarkTileComponent } from '../benchmark-tile/benchmark-tile.component';
import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksRoutingModule } from './benchmarks-routing.module';
import { BenchmarksTabComponent } from './benchmarks-tab.component';
import { ComparisonGroupHeaderComponent } from './comparison-group-header/comparison-group-header.component';
import { BenchmarksMetricComponent } from './metric/metric.component';
import { BenchmarksRankingsComponent } from './rankings/rankings.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, HighchartsChartModule, SharedModule, BenchmarksRoutingModule],
  declarations: [
    BenchmarksAboutTheDataComponent,
    BenchmarksMetricComponent,
    BenchmarksRankingsComponent,
    BenchmarkTileComponent,
    BenchmarksTabComponent,
    ComparisonGroupHeaderComponent,
    GaugeComponent,
    BarchartComponent,
    RankingContentComponent,
    FormatMoneyPipe,
    FormatPercentPipe,
  ],
  exports: [
    BenchmarksAboutTheDataComponent,
    BenchmarksMetricComponent,
    BenchmarksRankingsComponent,
    BenchmarkTileComponent,
    BenchmarksTabComponent,
    ComparisonGroupHeaderComponent,
    GaugeComponent,
    BarchartComponent,
    RankingContentComponent,
    FormatMoneyPipe,
    FormatPercentPipe,
  ],
  providers: [],
})
export class BenchmarksModule {}
