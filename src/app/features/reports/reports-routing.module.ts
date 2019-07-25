import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
