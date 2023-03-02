import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetTrainingByStatusResolver } from '@core/resolvers/get-training-by-status.resolver';
import { MissingMandatoryTrainingResolver } from '@core/resolvers/missing-mandatory-training.resolver';

import { ExpiredTrainingComponent } from './expired-training/expired-training.component';
import { ExpiringSoonTrainingComponent } from './expiring-soon-training/expiring-soon-training.component';
import { MissingMandatoryTrainingStatusComponent } from './missing-mandatory-training/missing-mandatory-training-status.component';

const routes: Routes = [
  {
    path: 'expired-training',
    component: ExpiredTrainingComponent,
    resolve: {
      training: GetTrainingByStatusResolver,
    },
    data: { title: 'Expired training', training: 'expired' },
  },
  {
    path: 'expires-soon-training',
    component: ExpiringSoonTrainingComponent,
    resolve: {
      training: GetTrainingByStatusResolver,
    },
    data: { title: 'Expiring training', training: 'expiring' },
  },
  {
    path: 'missing-mandatory-training',
    component: MissingMandatoryTrainingStatusComponent,
    resolve: {
      training: MissingMandatoryTrainingResolver,
    },
    data: { title: 'Missing mandatory training' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingAndQualificationsRoutingModule {}
