import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
