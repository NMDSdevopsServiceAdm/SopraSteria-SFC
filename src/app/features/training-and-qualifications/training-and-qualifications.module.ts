import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetTrainingByStatusResolver } from '@core/resolvers/get-training-by-status.resolver';
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
  providers: [GetTrainingByStatusResolver],
})
export class TrainingAndQualificationsModule {}
