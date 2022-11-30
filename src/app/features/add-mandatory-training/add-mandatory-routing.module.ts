import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListMandatoryTrainingComponent } from './list-mandatory-training/list-mandatory-training.component';

const routes: Routes = [
  {
    path: '',
    component: ListMandatoryTrainingComponent,
    data: { title: 'List Mandatory Training' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
