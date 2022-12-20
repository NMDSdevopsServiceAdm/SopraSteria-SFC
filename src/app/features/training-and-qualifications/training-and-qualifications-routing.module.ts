import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExpiredTrainingComponent } from './expired-training/expired-training.component';

const routes: Routes = [
  {
    path: 'expired-training',
    component: ExpiredTrainingComponent,
    data: { title: 'Expired training' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingAndQualificationsRoutingModule {}
