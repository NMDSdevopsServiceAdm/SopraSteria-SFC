import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { AddMultipleTrainingRoutingModule } from './add-multiple-training-routing.module';
import { SelectStaffErrorSummaryComponent } from './select-staff-error-summary/select-staff-error-summary.component';
import { ConfirmMultipleTrainingComponent } from './confirm-multiple-training/confirm-multiple-training.component';
import { SelectStaffComponent } from './select-staff/select-staff.component';
import { SelectedStaffPanelComponent } from './selected-staff-panel/selected-staff-panel.component';
import { MultipleTrainingDetailsComponent } from './training-details/training-details.component';
import { SelectTrainingCategoryMultipleComponent } from './select-training-category-multiple/select-training-category-multiple.component';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { SelectTrainingCourseForMultipleTrainingRecords } from './select-training-course-for-multiple-training-records/select-training-course-for-multiple-training-records.component';
import { TrainingCourseResolver } from '@core/resolvers/training/training-course.resolver';
import { ViewSelectedTrainingCourseDetailsComponent} from '@features/training-and-qualifications/add-multiple-training/view-selected-training-course-details/view-selected-training-course-details.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    AddMultipleTrainingRoutingModule,
  ],
  declarations: [
    SelectStaffComponent,
    MultipleTrainingDetailsComponent,
    SelectedStaffPanelComponent,
    SelectStaffErrorSummaryComponent,
    ConfirmMultipleTrainingComponent,
    SelectTrainingCategoryMultipleComponent,
    SelectTrainingCourseForMultipleTrainingRecords,
    ViewSelectedTrainingCourseDetailsComponent
  ],
  providers: [TrainingCategoriesResolver, TrainingCourseResolver],
})
export class AddMultipleTrainingModule {}
