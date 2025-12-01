import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course/update-records-select-training-course.component';

const routes: Routes = [
  {
    path: 'select-a-training-course',
    component: UpdateRecordsSelectTrainingCourseComponent,
    // resolve: {
    // },
    data: { title: 'Select a training course' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateRecordsWithTrainingCourseRoutingModule {}
