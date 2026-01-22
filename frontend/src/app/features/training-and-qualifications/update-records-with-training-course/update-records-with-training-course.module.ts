import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateRecordsSelectTrainingCourseComponent } from './update-records-select-training-course/update-records-select-training-course.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UpdateRecordsWithTrainingCourseRoutingModule } from './update-records-with-training-course-routing.module';
import { TrainingCoursesWithLinkableRecordsResolver } from '@core/resolvers/training/training-courses-with-linkable-records-resolver';
import { SelectTrainingRecordsToUpdateComponent } from './select-training-records-to-update/select-training-records-to-update.component';
import { YouHaveSelectedTrainingRecords } from './you-have-selected-training-records/you-have-selected-training-records';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, UpdateRecordsWithTrainingCourseRoutingModule],
  declarations: [UpdateRecordsSelectTrainingCourseComponent, SelectTrainingRecordsToUpdateComponent, YouHaveSelectedTrainingRecords],
  providers: [TrainingCoursesWithLinkableRecordsResolver],
})
export class UpdateRecordsWithTrainingCourseModule {}
