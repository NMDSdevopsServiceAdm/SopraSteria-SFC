import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SelectStaffComponent } from './select-staff/select-staff.component';
import { MultipleTrainingDetailsComponent } from './training-details/training-details.component';

const routes: Routes = [
  {
    path: 'select-staff',
    component: SelectStaffComponent,
    data: { title: 'Select staff' },
  },
  {
    path: 'training-details',
    component: MultipleTrainingDetailsComponent,
    data: {
      title: 'Training details',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMultipleTrainingRoutingModule {}
