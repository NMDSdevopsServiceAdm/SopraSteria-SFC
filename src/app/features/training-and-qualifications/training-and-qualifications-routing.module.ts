import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetTrainingByStatusResolver } from '@core/resolvers/get-training-by-status.resolver';

import { ExpiredTrainingComponent } from './expired-training/expired-training.component';

const routes: Routes = [
  {
    path: 'expired-training',
    component: ExpiredTrainingComponent,
    resolve: {
      expiredTraining: GetTrainingByStatusResolver,
    },
    data: { title: 'Expired training', training: 'expired' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingAndQualificationsRoutingModule {}
