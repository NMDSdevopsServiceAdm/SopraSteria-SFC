import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetTrainingByStatusResolver } from '@core/resolvers/get-training-by-status.resolver';
import { MissingMandatoryTrainingResolver } from '@core/resolvers/missing-mandatory-training.resolver';
import { SharedModule } from '@shared/shared.module';

import { ExpiredTrainingComponent } from './expired-training/expired-training.component';
import { ExpiringSoonTrainingComponent } from './expiring-soon-training/expiring-soon-training.component';
import { MissingMandatoryTrainingStatusComponent } from './missing-mandatory-training/missing-mandatory-training-status.component';
import { TrainingAndQualificationsRoutingModule } from './training-and-qualifications-routing.module';
import { PdfTraininAndQualificationActionList } from '@features/pdf/training-and-qualification-action-list/training-and-qualification-action-list.component';
import { PdfTraininAndQualificationTitle } from '@features/pdf/training-and-qualification-title/training-and-qualification-title.component';
import { SelectTrainingCategoryComponent } from './add-edit-training/select-training-category/select-training-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    TrainingAndQualificationsRoutingModule,
  ],
  declarations: [
    ExpiredTrainingComponent,
    ExpiringSoonTrainingComponent,
    MissingMandatoryTrainingStatusComponent,
    PdfTraininAndQualificationActionList,
    PdfTraininAndQualificationTitle,
    SelectTrainingCategoryComponent,
  ],
  providers: [GetTrainingByStatusResolver, MissingMandatoryTrainingResolver],
})
export class TrainingAndQualificationsModule {}
