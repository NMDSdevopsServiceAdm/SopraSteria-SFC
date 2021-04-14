import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';

const routes: Routes = [
  {
    path: 'overview',
    component: WdfOverviewComponent,
    data: { title: 'Workforce Development Fund' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
