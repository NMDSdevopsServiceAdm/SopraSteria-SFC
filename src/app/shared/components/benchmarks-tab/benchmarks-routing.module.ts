import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { MetricsContent } from '@core/model/benchmarks.model';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { BenchmarksMetricComponent } from '@shared/components/benchmarks-tab/metric/metric.component';
import { BenchmarksRankingsComponent } from '@shared/components/benchmarks-tab/rankings/rankings.component';

const routes: Routes = [
  {
    path: 'about-the-data',
    component: BenchmarksAboutTheDataComponent,
    data: {
      title: 'About the data',
    },
  },
  {
    path: 'rankings',
    component: BenchmarksRankingsComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      title: 'Rankings',
      permissions: ['canViewBenchmarks'],
    },
  },
  {
    path: 'pay',
    component: BenchmarksMetricComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      ...MetricsContent.Pay,
      permissions: ['canViewBenchmarks'],
    },
  },
  {
    path: 'turnover',
    component: BenchmarksMetricComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      ...MetricsContent.Turnover,
      permissions: ['canViewBenchmarks'],
    },
  },
  {
    path: 'qualifications',
    component: BenchmarksMetricComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      ...MetricsContent.Qualifications,
      permissions: ['canViewBenchmarks'],
    },
  },
  {
    path: 'sickness',
    component: BenchmarksMetricComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      ...MetricsContent.Sickness,
      permissions: ['canViewBenchmarks'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BenchmarksRoutingModule {}
