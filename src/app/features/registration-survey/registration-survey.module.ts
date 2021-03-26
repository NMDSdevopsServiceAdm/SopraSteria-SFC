import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { HowDidYouHearAboutComponent } from './how-did-you-hear-about/how-did-you-hear-about.component';
import { ParticipationComponent } from './participation/participation.component';
import { RegistrationSurveyRoutingModule } from './registration-survey-routing.module';
import { WhyCreateAccountComponent } from './why-create-account/why-create-account.component';

@NgModule({
  imports: [CommonModule, SharedModule, OverlayModule, RegistrationSurveyRoutingModule],
  declarations: [ParticipationComponent, WhyCreateAccountComponent, HowDidYouHearAboutComponent],
  providers: [],
})
export class RegistrationSurveyModule {}
