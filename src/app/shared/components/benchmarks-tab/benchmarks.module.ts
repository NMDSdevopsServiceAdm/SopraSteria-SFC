import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BenchmarksRoutingModule } from '@shared/components/benchmarks-tab/benchmarks-routing.module';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { BenchmarksMetricComponent } from './metric/metric.component';

@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule, BenchmarksRoutingModule],
  declarations: [BenchmarksAboutTheDataComponent, BenchmarksMetricComponent],
  exports: [BenchmarksAboutTheDataComponent, BenchmarksMetricComponent],
  providers: [],
})
export class BenchmarksModule {}
