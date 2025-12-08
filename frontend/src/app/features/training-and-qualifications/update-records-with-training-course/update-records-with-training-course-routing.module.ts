import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course/update-records-select-training-course.component';
import { TrainingCoursesWithLinkableRecordsResolver } from '@core/resolvers/training/training-courses-with-linkable-records-resolver';

const routes: Routes = [
  {
    path: '',
    resolve: {
      trainingCoursesWithLinkableRecords: TrainingCoursesWithLinkableRecordsResolver,
    },
    children: [
      {
        path: 'select-a-training-course',
        component: UpdateRecordsSelectTrainingCourseComponent,
        data: { title: 'Select a training course' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateRecordsWithTrainingCourseRoutingModule {}
