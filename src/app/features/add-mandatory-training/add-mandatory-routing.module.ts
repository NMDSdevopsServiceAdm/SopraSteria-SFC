import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  DeleteMandatoryTrainingCategoryComponent,
} from '@features/delete-mandatory-training-category/delete-mandatory-training-category.component';

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
  {
    path: 'delete-mandatory-training-category',
    component: DeleteMandatoryTrainingCategoryComponent,
    data: { title: 'Delete Mandatory Training Category' },
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
