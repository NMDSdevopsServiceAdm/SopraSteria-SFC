import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseResolver, TrainingCoursesToLoad } from '@core/resolvers/training/training-course.resolver';
import { TrainingCourseDetailsComponent } from './training-course-details/training-course-details.component';
import { TrainingCourseCategoryComponent } from './training-course-category/training-course-category.component';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';

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
      trainingCoursesToLoad: 'ALL' as TrainingCoursesToLoad,
    },
    resolve: { trainingCourses: TrainingCourseResolver },
  },
  {
    path: 'add-training-course',
    data: {
      permissions: ['canEditWorker'],
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
        resolve: {
          trainingCategories: TrainingCategoriesResolver,
        },
        data: {
          title: 'Select training course category',
          journeyType: 'Add',
        },
      },
    ],
  },
  {
    path: ':trainingCourseUid',
    resolve: { trainingCourses: TrainingCourseResolver },
    children: [
      {
        path: 'edit-details',
        component: TrainingCourseDetailsComponent,
        data: {
          title: 'Edit training course details',
          journeyType: 'Edit',
        },
      },
      // {
      //   path: 'change-category',
      // },
      // {
      //   path: 'select-which-to-apply',
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingCourseRoutingModule {}
