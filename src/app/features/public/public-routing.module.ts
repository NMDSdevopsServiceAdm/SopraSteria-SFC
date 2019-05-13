import { ContactUsComponent } from '@features/public/contact-us/contact-us.component';
import { FeedbackComponent } from '@features/public/feedback/feedback.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
