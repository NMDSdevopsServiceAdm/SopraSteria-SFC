import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { WdfReportComponent } from './wdf-report/wdf-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    data: { title: 'Reports' },
  },
  {
    path: 'wdf',
    component: WdfReportComponent,
    data: { title: 'Workplace Development Fund Report' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
