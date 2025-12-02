import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course/update-records-select-training-course.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UpdateRecordsWithTrainingCourseRoutingModule } from './update-records-with-training-course-routing.module';
import { TrainingCoursesWithLinkableRecordsResolver } from '@core/resolvers/training/training-courses-with-linkable-records-resolver';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, UpdateRecordsWithTrainingCourseRoutingModule],
  declarations: [UpdateRecordsSelectTrainingCourseComponent],
  providers: [TrainingCoursesWithLinkableRecordsResolver],
})
export class UpdateRecordsWithTrainingCourseModule {}
