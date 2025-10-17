import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseRoutingModule } from './training-course-routing.module';

@NgModule({
  imports: [CommonModule, TrainingCourseRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [AddAndManageTrainingCoursesComponent],
})
export class TrainingCourseModule {}
