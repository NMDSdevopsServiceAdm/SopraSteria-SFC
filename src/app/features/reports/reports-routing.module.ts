import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WdfWorkerComponent } from '@features/reports/pages/wdf-worker/wdf-worker.component';
import { WdfComponent } from '@features/reports/pages/wdf/wdf.component';

import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
  },
  {
    path: 'wdf',
    data: { title: 'Workplace Development Fund Report' },
    children: [
      {
        path: '',
        component: WdfComponent,
      },
      {
        path: 'worker/:id',
        component: WdfWorkerComponent,
        resolve: { worker: WorkerResolver },
        data: { title: 'Staff Summary' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
