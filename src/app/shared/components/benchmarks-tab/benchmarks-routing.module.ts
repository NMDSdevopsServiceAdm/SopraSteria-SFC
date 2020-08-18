import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenchmarksAboutTheDataComponent } from '@shared/components/benchmarks-tab/about-the-data/about-the-data.component';

const routes: Routes = [
  {
    path: 'about-the-data/:establishmentID',
    component: BenchmarksAboutTheDataComponent,
    canActivate: [],
    data: { title: 'View My Workplaces' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BenchmarksRoutingModule {}
