import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //   {
  //     path: '',
  //     component: WdfOverviewComponent,
  //     data: { title: 'Workforce Development Fund' },
  //   },
  //   {
  //     path: 'data',
  //     component: WdfDataComponent,
  //     canActivate: [HasPermissionsGuard],
  //     data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
  //   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfClaimsRoutingModule {}
