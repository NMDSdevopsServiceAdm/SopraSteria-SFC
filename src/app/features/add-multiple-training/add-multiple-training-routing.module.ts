import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkersResolver } from '@core/resolvers/workers.resolver';

import { SelectStaffComponent } from './select-staff/select-staff.component';

const routes: Routes = [
  {
    path: 'select-staff',
    component: SelectStaffComponent,
    resolve: {
      workers: WorkersResolver,
    },
    data: { title: 'Select staff' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMultipleTrainingRoutingModule {}
