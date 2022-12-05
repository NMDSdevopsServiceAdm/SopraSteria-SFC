import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { StaffDetailsComponent } from '@features/workers/staff-details/staff-details.component';

import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary/wdf-workplaces-summary.component';

const routes: Routes = [
  {
    path: '',
    // remove following 2 lines when wdf new design feature is live
    component: WdfOverviewComponent,
    data: { title: 'Workforce Development Fund' },
    // uncomment following 2 lines when wdf new design feature is live
    // redirectTo: 'data',
    // pathMatch: 'full',
  },
  {
    path: 'data',
    component: WdfDataComponent,
    canActivate: [HasPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
  },
  {
    path: 'staff-record/:id',
    children: [
      {
        path: '',
        component: WdfStaffRecordComponent,
        data: { title: 'WDF Staff Record' },
      },
      {
        path: 'staff-details',
        component: StaffDetailsComponent,
        data: { title: 'Staff Details' },
      },
    ],
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
        children: [
          {
            path: '',
            component: WdfDataComponent,
            canActivate: [HasPermissionsGuard],
            data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
          },
          {
            path: 'staff-record/:id',
            component: WdfStaffRecordComponent,
            data: { title: 'WDF Staff Record' },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
