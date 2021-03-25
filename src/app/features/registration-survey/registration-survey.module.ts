import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { RegistrationSurveyRoutingModule } from './registration-survey-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, OverlayModule, RegistrationSurveyRoutingModule],
  declarations: [],
  providers: [],
})
export class RegistrationSurveyModule {}
