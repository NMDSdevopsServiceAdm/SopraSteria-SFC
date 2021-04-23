import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { HowDidYouHearAboutComponent } from './how-did-you-hear-about/how-did-you-hear-about.component';
import { ParticipationComponent } from './participation/participation.component';
import { RegistrationSurveyRoutingModule } from './registration-survey-routing.module';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { WhyCreateAccountComponent } from './why-create-account/why-create-account.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, RegistrationSurveyRoutingModule],
  declarations: [ParticipationComponent, WhyCreateAccountComponent, HowDidYouHearAboutComponent, ThankYouComponent],
  providers: [],
})
export class RegistrationSurveyModule {}
