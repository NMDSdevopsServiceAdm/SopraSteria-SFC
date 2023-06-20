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
  {
    path: 'positive-workplace',
    component: PublicPageComponent,
    data: { title: 'Create a positive place to work' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'maximise-recruitment',
    component: PublicPageComponent,
    data: { title: 'Maximise recruitment' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'workplace-retention-top-tips',
    component: PublicPageComponent,
    data: { title: 'Top tips for adult social care workforce retention' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'internal-recruitment',
    component: PublicPageComponent,
    data: { title: 'International recruitment' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'social-media-for-recruiting',
    component: PublicPageComponent,
    data: { title: 'Social media for recruiting care workers' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'maximise-retention',
    component: PublicPageComponent,
    data: { title: 'Maximise retention' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'planning-recruitment',
    component: PublicPageComponent,
    data: { title: 'Planning recruitment' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'maximising-recruitment',
    component: PublicPageComponent,
    data: { title: 'Maximising recruitment' },
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
