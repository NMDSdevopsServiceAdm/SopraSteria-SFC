import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';

const routes: Routes = [
  {
    path: '',
    component: AddMandatoryTrainingComponent,
    data: { title: 'Add Mandatory Training' },
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMandatoryTrainingRoutingModule {}
