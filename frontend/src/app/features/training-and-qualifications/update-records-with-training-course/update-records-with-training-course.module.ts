import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course/update-records-select-training-course.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UpdateRecordsWithTrainingCourseRoutingModule } from './update-records-with-training-course-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, UpdateRecordsWithTrainingCourseRoutingModule],
  declarations: [UpdateRecordsSelectTrainingCourseComponent],
})
export class UpdateRecordsWithTrainingCourseModule {}
