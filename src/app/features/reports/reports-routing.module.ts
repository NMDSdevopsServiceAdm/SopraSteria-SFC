import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';

import { ReportsComponent } from './pages/reports/reports.component';
import { WdfComponent } from './pages/wdf/wdf.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
  },
  {
    path: 'wdf',
    canActivate: [CheckPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'Workforce Development Fund Report' },
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
