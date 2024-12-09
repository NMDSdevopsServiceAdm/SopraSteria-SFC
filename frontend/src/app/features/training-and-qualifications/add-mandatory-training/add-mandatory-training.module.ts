import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { AddMandatoryTrainingRoutingModule } from '@features/training-and-qualifications/add-mandatory-training/add-mandatory-routing.module';
import { DeleteMandatoryTrainingCategoryComponent } from '@features/training-and-qualifications/add-mandatory-training/delete-mandatory-training-category/delete-mandatory-training-category.component';
import { SharedModule } from '@shared/shared.module';

import { AddAndManageMandatoryTrainingComponent } from './add-and-manage-mandatory-training/add-and-manage-mandatory-training.component';
import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';
import { RemoveAllMandatoryTrainingComponent } from './delete-mandatory-training/delete-all-mandatory-training.component';
import { SelectTrainingCategoryMandatoryComponent } from './select-training-category-mandatory/select-training-category-mandatory.component';

@NgModule({
  imports: [CommonModule, AddMandatoryTrainingRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AddMandatoryTrainingComponent,
    SelectTrainingCategoryMandatoryComponent,
    RemoveAllMandatoryTrainingComponent,
    AddAndManageMandatoryTrainingComponent,
    DeleteMandatoryTrainingCategoryComponent,
  ],
  providers: [TrainingCategoriesResolver],
})
export class AddMandatoryTrainingModule {}
