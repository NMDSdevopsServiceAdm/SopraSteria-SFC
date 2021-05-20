import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary/wdf-workplaces-summary.component';

const routes: Routes = [
  {
    path: '',
    component: WdfOverviewComponent,
    data: { title: 'Workforce Development Fund' },
  },
  {
    path: 'data',
    component: WdfDataComponent,
    data: { title: 'WDF data' },
  },
  {
    path: 'staff-record/:id',
    component: WdfStaffRecordComponent,
    data: { title: 'WDF Staff Record' },
  },
  {
    path: 'workplaces',
    component: WdfWorkplacesSummaryComponent,
    data: { title: 'WDF Workplaces' },
    children: [],
  },
  {
    path: ':id/data',
    component: WdfDataComponent,
    data: { title: 'WDF data' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
