import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';
import { ListMandatoryTrainingComponent } from './list-mandatory-training/list-mandatory-training.component';

const routes: Routes = [
  {
    path: '',
    component: ListMandatoryTrainingComponent,
    data: { title: 'List Mandatory Training' },
  },
  {
    path: 'add-new-mandatory-training',
    component: AddMandatoryTrainingComponent,
    data: { title: 'Add New Mandatory Training' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
