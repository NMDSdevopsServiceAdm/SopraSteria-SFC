import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ReportsGuard } from '@core/guards/reports.guard';

import { ReportsComponent } from './pages/reports/reports.component';
import { WdfComponent } from './pages/wdf/wdf.component';
import { WorkplacesComponent } from './pages/workplaces/workplaces.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [ReportsGuard],
    component: ReportsComponent,
  },
  {
    path: 'all-workplaces',
    component: WorkplacesComponent,
  },
  {
    path: 'workplace/:establishmentuid/wdf',
    canActivate: [HasPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'Workforce Development Fund Report' },
    children: [
      {
        path: '',
        component: WdfComponent,
        canActivate: [CheckPermissionsGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
