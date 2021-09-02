import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SelectStaffComponent } from './select-staff/select-staff.component';

const routes: Routes = [
  {
    path: 'select-staff',
    component: SelectStaffComponent,
    data: { title: 'Select staff' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMultipleTrainingRoutingModule {}
