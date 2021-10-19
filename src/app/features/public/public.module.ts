import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { AccessibilityStatementComponent } from './accessibility-statement/accessibility-statement.component';
import { ContactUsOrLeaveFeedbackComponent } from './contact-us-or-leave-feedback/contact-us-or-leave-feedback.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PrivacyNoticeComponent } from './privacy-notice/privacy-notice.component';
import { PublicPageComponent } from './public-page/public-page.component';
import { PublicRoutingModule } from './public-routing.module';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

@NgModule({
  imports: [CommonModule, PublicRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [
    AccessibilityStatementComponent,
    ContactUsComponent,
    CookiePolicyComponent,
    FeedbackComponent,
    PrivacyNoticeComponent,
    TermsConditionsComponent,
    ContactUsOrLeaveFeedbackComponent,
    ThankYouComponent,
    PublicPageComponent,
  ],
})
export class PublicModule {}
