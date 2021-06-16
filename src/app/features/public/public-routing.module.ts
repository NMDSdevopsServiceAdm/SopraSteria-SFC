import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessibilityStatementComponent } from '@features/public/accessibility-statement/accessibility-statement.component';
import { ContactUsComponent } from '@features/public/contact-us/contact-us.component';
import { CookiePolicyComponent } from '@features/public/cookie-policy/cookie-policy.component';
import { FeedbackComponent } from '@features/public/feedback/feedback.component';
import { PrivacyNoticeComponent } from '@features/public/privacy-notice/privacy-notice.component';
import { TermsConditionsComponent } from '@features/public/terms-conditions/terms-conditions.component';

import { ContactUsOrLeaveFeedbackComponent } from './contact-us-or-leave-feedback/contact-us-or-leave-feedback.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

const routes: Routes = [
  {
    path: 'contact-us-or-leave-feedback',
    component: ContactUsOrLeaveFeedbackComponent,
    data: { title: 'Contact us or leave feedback' },
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
    data: { title: 'Contact us' },
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    data: { title: 'Feedback' },
  },
  {
    path: 'thank-you',
    component: ThankYouComponent,
    data: { title: 'Thank you' },
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
    data: { title: 'Terms and conditions' },
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent,
    data: { title: 'Cookie policy' },
  },
  {
    path: 'accessibility-statement',
    component: AccessibilityStatementComponent,
    data: { title: 'Accessibility statement' },
  },
  {
    path: 'privacy-notice',
    component: PrivacyNoticeComponent,
    data: { title: 'Privacy notice' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
