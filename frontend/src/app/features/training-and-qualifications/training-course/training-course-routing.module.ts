import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseResolver } from '@core/resolvers/training/training-course.resolver';
import { TrainingCourseDetailsComponent } from './training-course-details/training-course-details.component';
import { TrainingCourseCategoryComponent } from './training-course-category/training-course-category.component';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { TrainingProvidersResolver } from '@core/resolvers/training/training-providers.resolver';
import { SelectWhichTrainingRecordsToApplyComponent } from './select-which-training-records-to-apply/select-which-training-records-to-apply.component';
import { RemoveTrainingCourseComponent } from './remove-training-course/remove-training-course.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'add-and-manage-training-courses',
    pathMatch: 'full',
  },
  {
    path: 'add-and-manage-training-courses',
    component: AddAndManageTrainingCoursesComponent,
    data: {
      permissions: ['canEditWorker'],
      title: 'Add and manage training course',
    },
    resolve: { trainingCourses: TrainingCourseResolver },
  },
  {
    path: 'add-training-course',
    data: {
      permissions: ['canEditWorker'],
    },
    resolve: {
      trainingCategories: TrainingCategoriesResolver,
      trainingProviders: TrainingProvidersResolver,
    },
    children: [
      {
        path: 'details',
        component: TrainingCourseDetailsComponent,
        data: {
          title: 'Add training course details',
          journeyType: 'Add',
        },
      },

      {
        path: 'select-category',
        component: TrainingCourseCategoryComponent,
        data: {
          title: 'Select training course category',
          journeyType: 'Add',
        },
      },
    ],
  },
  {
    path: 'remove-all-training-courses',
    component: RemoveTrainingCourseComponent,
    resolve: { trainingCourses: TrainingCourseResolver },
    data: {
      title: 'Remove all training course',
      journeyType: 'RemoveAll',
    },
  },
  {
    path: ':trainingCourseUid',
    resolve: {
      trainingCourses: TrainingCourseResolver,
      trainingProviders: TrainingProvidersResolver,
      trainingCategories: TrainingCategoriesResolver,
    },
    children: [
      {
        path: 'details',
        component: TrainingCourseDetailsComponent,
        data: {
          title: 'Edit training course details',
          journeyType: 'Edit',
        },
      },
      {
        path: 'remove',
        component: RemoveTrainingCourseComponent,
        data: {
          title: 'Remove training course',
          journeyType: 'RemoveSingle',
        },
      },
      {
        path: 'change-category',
        component: TrainingCourseCategoryComponent,
        data: {
          title: 'Select training course category',
          journeyType: 'Edit',
        },
      },
      {
        path: 'select-which-training-records-to-apply',
        component: SelectWhichTrainingRecordsToApplyComponent,
        data: {
          title: 'Select which training records to apply to',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingCourseRoutingModule {}
