import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ExpiredTrainingComponent } from './expired-training/expired-training.component';
import { TrainingAndQualificationsRoutingModule } from './training-and-qualifications-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    TrainingAndQualificationsRoutingModule,
  ],
  declarations: [ExpiredTrainingComponent],
  providers: [],
})
export class TrainingAndQualificationsModule {}
