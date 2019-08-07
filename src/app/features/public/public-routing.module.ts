import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessibilityStatementComponent } from '@features/public/accessibility-statement/accessibility-statement.component';
import { ContactUsComponent } from '@features/public/contact-us/contact-us.component';
import { CookiePolicyComponent } from '@features/public/cookie-policy/cookie-policy.component';
import { FeedbackComponent } from '@features/public/feedback/feedback.component';
import { PrivacyNoticeComponent } from '@features/public/privacy-notice/privacy-notice.component';
import { TermsConditionsComponent } from '@features/public/terms-conditions/terms-conditions.component';

const routes: Routes = [
  {
    path: 'contact-us',
    component: ContactUsComponent,
    data: { title: 'Contact Us' },
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    data: { title: 'Give us Feedback' },
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
    data: { title: 'Terms and Conditions' },
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent,
    data: { title: 'Cookie Policy' },
  },
  {
    path: 'accessibility-statement',
    component: AccessibilityStatementComponent,
    data: { title: 'Accessibility Statement' },
  },
  {
    path: 'privacy-notice',
    component: PrivacyNoticeComponent,
    data: { title: 'Privacy Notice' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
