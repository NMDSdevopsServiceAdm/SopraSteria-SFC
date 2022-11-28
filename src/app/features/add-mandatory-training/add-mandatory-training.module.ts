import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMandatoryTrainingRoutingModule } from '@features/add-mandatory-training/add-mandatory-routing.module';
import { RemoveAllMandatoryTrainingComponent } from '@features/add-mandatory-training/delete-all-mandatory-training.component';
import { SharedModule } from '@shared/shared.module';

import { AddAndManageMandatoryTrainingComponent } from './add-and-manage-mandatory-training/add-and-manage-mandatory-training.component';
import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';

@NgModule({
  imports: [CommonModule, AddMandatoryTrainingRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AddMandatoryTrainingComponent,
    RemoveAllMandatoryTrainingComponent,
    AddAndManageMandatoryTrainingComponent,
  ],
})
export class AddMandatoryTrainingModule {}
