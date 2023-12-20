import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMultipleTrainingInProgressGuard } from '@core/guards/add-multiple-training-in-progress/add-multiple-training-in-progress.guard';
import { WorkersResolver } from '@core/resolvers/workers.resolver';

import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training/confirm-multiple-training.component';
import { SelectStaffComponent } from './select-staff/select-staff.component';
import { MultipleTrainingDetailsComponent } from './training-details/training-details.component';

const selectStaffRoute = {
  path: 'select-staff',
  component: SelectStaffComponent,
  data: { title: 'Select staff', workerPagination: false },
  resolve: {
    workers: WorkersResolver,
  },
};

const trainingDetailsRoute = {
  path: 'training-details',
  component: MultipleTrainingDetailsComponent,
  data: {
    title: 'Training details',
  },
};

const trainingDetailsRouteWithGuard = {
  ...trainingDetailsRoute,
  canActivate: [AddMultipleTrainingInProgressGuard],
};

const routes: Routes = [
  selectStaffRoute,
  trainingDetailsRouteWithGuard,
  {
    path: 'confirm-training',
    canActivate: [AddMultipleTrainingInProgressGuard],
    children: [
      {
        path: '',
        component: ConfirmMultipleTrainingComponent,
        data: { title: 'Confirm multiple training' },
      },
      selectStaffRoute,
      trainingDetailsRoute,
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMultipleTrainingRoutingModule {}
