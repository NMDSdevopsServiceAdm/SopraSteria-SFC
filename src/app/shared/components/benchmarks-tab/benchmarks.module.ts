import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormatMoneyPipe } from '@shared/pipes/format-money.pipe';
import { FormatPercentPipe } from '@shared/pipes/format-percent.pipe';
import { SharedModule } from '@shared/shared.module';

import { BenchmarksMetricModule } from '../benchmark-metric/benchmark-metric.module';
import { BenchmarkTileComponent } from '../benchmark-tile/benchmark-tile.component';
import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksTabComponent } from './benchmarks-tab.component';
import { ComparisonGroupHeaderComponent } from './comparison-group-header/comparison-group-header.component';
import { BenchmarksMetricComponent } from './metric/metric.component';
import { BenchmarksRankingsComponent } from './rankings/rankings.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, BenchmarksMetricModule, SharedModule],
  declarations: [
    BenchmarksAboutTheDataComponent,
    BenchmarksMetricComponent,
    BenchmarksRankingsComponent,
    BenchmarkTileComponent,
    BenchmarksTabComponent,
    ComparisonGroupHeaderComponent,
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
    FormatMoneyPipe,
    FormatPercentPipe,
  ],
  providers: [],
})
export class BenchmarksModule {}
