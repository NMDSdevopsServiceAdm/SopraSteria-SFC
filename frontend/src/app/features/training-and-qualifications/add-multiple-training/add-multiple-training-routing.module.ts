import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMultipleTrainingInProgressGuard } from '@core/guards/add-multiple-training-in-progress/add-multiple-training-in-progress.guard';
import { WorkersResolver } from '@core/resolvers/workers.resolver';

import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training/confirm-multiple-training.component';
import { SelectStaffComponent } from './select-staff/select-staff.component';
import { MultipleTrainingDetailsComponent } from './training-details/training-details.component';
import { SelectTrainingCategoryMultipleComponent } from './select-training-category-multiple/select-training-category-multiple.component';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { SelectTrainingCourseForMultipleTrainingRecords } from './select-training-course-for-multiple-training-records/select-training-course-for-multiple-training-records.component';
import { TrainingCourseResolver } from '@core/resolvers/training/training-course.resolver';
import { ViewSelectedTrainingCourseDetailsComponent } from '@features/training-and-qualifications/add-multiple-training/view-selected-training-course-details/view-selected-training-course-details.component';
import { TrainingProvidersResolver } from '@core/resolvers/training/training-providers.resolver';

const selectStaffRoute = {
  path: 'select-staff',
  component: SelectStaffComponent,
  data: { title: 'Select staff', workerPagination: false },
  resolve: {
    workers: WorkersResolver,
    trainingCourses: TrainingCourseResolver,
  },
};

const selectTrainingCourseRoute = {
  path: 'select-training-course',
  component: SelectTrainingCourseForMultipleTrainingRecords,
  data: { title: 'How do you want to continue' },
  resolve: {
    trainingCourses: TrainingCourseResolver,
  },
};

const selectTrainingCategoryRoute = {
  path: 'select-training-category',
  component: SelectTrainingCategoryMultipleComponent,
  data: { title: 'Select training category' },
  resolve: {
    trainingCategories: TrainingCategoriesResolver,
  },
};

const selectTrainingCategoryRouteWithGuard = {
  ...selectTrainingCategoryRoute,
  canActivate: [AddMultipleTrainingInProgressGuard],
};

const trainingDetailsRoute = {
  path: 'training-details',
  component: MultipleTrainingDetailsComponent,
  data: {
    title: 'Training details',
  },
  resolve: {
    trainingProviders: TrainingProvidersResolver,
  },
};

const trainingDetailsRouteWithGuard = {
  ...trainingDetailsRoute,
  canActivate: [AddMultipleTrainingInProgressGuard],
};

const viewSelectedTrainingCourseDetailsRoute = {
  path: 'view-selected-training-course-details',
  component: ViewSelectedTrainingCourseDetailsComponent,
  data: { title: 'Add training record details' },
  resolve: {
    trainingCourses: TrainingCourseResolver,
  },
};

const routes: Routes = [
  viewSelectedTrainingCourseDetailsRoute,
  selectStaffRoute,
  selectTrainingCourseRoute,
  selectTrainingCategoryRouteWithGuard,
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
      selectTrainingCourseRoute,
      selectTrainingCategoryRoute,
      trainingDetailsRoute,
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddMultipleTrainingRoutingModule {}
