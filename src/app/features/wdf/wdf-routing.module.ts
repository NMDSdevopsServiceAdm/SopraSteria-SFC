import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';

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
    canActivate: [HasPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
  },
  {
    path: 'staff-record/:id',
    component: WdfStaffRecordComponent,
    data: { title: 'WDF Staff Record' },
  },
  {
    path: 'workplaces',
    children: [
      {
        path: '',
        component: WdfWorkplacesSummaryComponent,
        data: { title: 'WDF Workplaces' },
      },
      {
        path: ':establishmentuid',
        component: WdfDataComponent,
        canActivate: [HasPermissionsGuard],
        data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
