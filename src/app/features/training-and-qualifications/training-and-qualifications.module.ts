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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    TrainingAndQualificationsRoutingModule,
  ],
  declarations: [ExpiredTrainingComponent, ExpiringSoonTrainingComponent, MissingMandatoryTrainingStatusComponent],
  providers: [GetTrainingByStatusResolver, MissingMandatoryTrainingResolver],
})
export class TrainingAndQualificationsModule {}
