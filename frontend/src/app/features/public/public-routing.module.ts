import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageResolver } from '@core/resolvers/page.resolver';
import { FeedbackComponent } from '@features/public/feedback/feedback.component';
import { PublicPageComponent } from '@features/public/public-page/public-page.component';

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
    component: PublicPageComponent,
    data: { title: 'Contact us', returnToHomeButton: true },
    resolve: {
      pages: PageResolver,
    },
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
    component: PublicPageComponent,
    data: { title: 'Terms and conditions' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'cookie-policy',
    component: PublicPageComponent,
    data: { title: 'Cookie policy' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'accessibility-statement',
    component: PublicPageComponent,
    data: { title: 'Accessibility statement' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'privacy-notice',
    component: PublicPageComponent,
    data: { title: 'Privacy notice' },
    resolve: {
      pages: PageResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
