import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ContactUsComponent } from './contact-us/contact-us.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PublicRoutingModule } from './public-routing.module';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

@NgModule({
  imports: [CommonModule, PublicRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [ContactUsComponent, CookiePolicyComponent, FeedbackComponent, TermsConditionsComponent],
})
export class PublicModule {}
