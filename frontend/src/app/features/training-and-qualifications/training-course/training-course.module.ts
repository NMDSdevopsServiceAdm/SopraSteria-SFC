import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { AddAndManageTrainingCoursesComponent } from './add-and-manage-training-courses/add-and-manage-training-courses.component';
import { TrainingCourseRoutingModule } from './training-course-routing.module';
import { TrainingCourseResolver } from '@core/resolvers/training/training-course.resolver';
import { TrainingCourseDetailsComponent } from './training-course-details/training-course-details.component';
import { TrainingCourseCategoryComponent } from './training-course-category/training-course-category.component';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { SelectWhatTrainingRecordsToApplyComponent } from './select-what-training-records-to-apply/select-what-training-records-to-apply.component';

@NgModule({
  imports: [CommonModule, TrainingCourseRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AddAndManageTrainingCoursesComponent,
    TrainingCourseDetailsComponent,
    TrainingCourseCategoryComponent,
    SelectWhatTrainingRecordsToApplyComponent,
  ],
  providers: [TrainingCourseResolver, TrainingCategoriesResolver],
})
export class TrainingCourseModule {}
