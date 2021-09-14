import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { SharedModule } from '@shared/shared.module';

import { AddMultipleTrainingRoutingModule } from './add-multiple-training-routing.module';
import { SelectStaffComponent } from './select-staff/select-staff.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, AddMultipleTrainingRoutingModule],
  declarations: [SelectStaffComponent],
  providers: [WorkersResolver],
})
export class AddMultipleTrainingModule {}
