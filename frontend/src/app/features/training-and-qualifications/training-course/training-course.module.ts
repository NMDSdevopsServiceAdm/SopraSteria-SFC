import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseRoutingModule } from './training-course-routing.module';
import { TrainingCourseResolver } from '@core/resolvers/training/training-course.resolver';

@NgModule({
  imports: [CommonModule, TrainingCourseRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [AddAndManageTrainingCoursesComponent],
  providers: [TrainingCourseResolver],
})
export class TrainingCourseModule {}
