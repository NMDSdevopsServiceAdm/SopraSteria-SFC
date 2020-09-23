import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';

const routes: Routes = [
  {
    path: ':establishmentuid/about-the-data',
    component: BenchmarksAboutTheDataComponent,
    canActivate: [CheckPermissionsGuard],
    data: {
      title: 'About the data',
      permissions: ['canViewBenchmarks'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BenchmarksRoutingModule {}
