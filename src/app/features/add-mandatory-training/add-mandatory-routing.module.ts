import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddAndManageMandatoryTrainingComponent } from './add-and-manage-mandatory-training/add-and-manage-mandatory-training.component';
import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';
import { RemoveAllMandatoryTrainingComponent } from './delete-mandatory-training/delete-all-mandatory-training.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AddAndManageMandatoryTrainingComponent,
        data: { title: 'List Mandatory Training' },
      },
      {
        path: 'remove-all-mandatory-training',
        component: RemoveAllMandatoryTrainingComponent,
        data: { title: 'Remove All Mandatory Training' },
      },
      {
        path: 'add-new-mandatory-training',
        component: AddMandatoryTrainingComponent,
        data: { title: 'Add New Mandatory Training' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
