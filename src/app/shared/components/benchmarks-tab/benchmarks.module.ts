import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BenchmarksMetricModule } from '../benchmark-metric/benchmark-metric.module';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksMetricComponent } from './metric/metric.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, BenchmarksMetricModule],
  declarations: [BenchmarksAboutTheDataComponent, BenchmarksMetricComponent],
  exports: [BenchmarksAboutTheDataComponent, BenchmarksMetricComponent],
  providers: [],
})
export class BenchmarksModule {}
