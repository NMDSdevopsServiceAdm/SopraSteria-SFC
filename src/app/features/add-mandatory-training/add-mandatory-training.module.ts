import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMandatoryTrainingRoutingModule } from '@features/add-mandatory-training/add-mandatory-routing.module';
import { RemoveAllSelectionsDialogComponent } from '@features/add-mandatory-training/remove-all-selections-dialog.component';
import { SharedModule } from '@shared/shared.module';

import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';

@NgModule({
  imports: [CommonModule, AddMandatoryTrainingRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [AddMandatoryTrainingComponent, RemoveAllSelectionsDialogComponent],
})
export class AddMandatoryTrainingModule {}
