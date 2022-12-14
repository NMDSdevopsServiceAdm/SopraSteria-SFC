import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeleteMandatoryTrainingCategoryComponent } from '@features/delete-mandatory-training-category/delete-mandatory-training-category.component';

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
  {
    path: ':trainingCategoryId',
    children: [
      {
        path: 'edit-mandatory-training',
        component: AddMandatoryTrainingComponent,
        data: { title: 'Edit Mandatory Training' },
      },
      {
        path: 'delete-mandatory-training-category',
        component: DeleteMandatoryTrainingCategoryComponent,
        data: { title: 'Delete Mandatory Training Category' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
