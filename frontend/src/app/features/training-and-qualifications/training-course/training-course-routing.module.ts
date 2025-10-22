import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseResolver, TrainingCoursesToLoad } from '@core/resolvers/training/training-course.resolver';
import { TrainingCourseDetailsComponent } from './training-course-details/training-course-details.component';

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
