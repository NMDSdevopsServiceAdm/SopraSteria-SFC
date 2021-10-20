import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

import { ContactUsOrLeaveFeedbackComponent } from './contact-us-or-leave-feedback/contact-us-or-leave-feedback.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PublicPageComponent } from './public-page/public-page.component';
import { PublicRoutingModule } from './public-routing.module';
import { ThankYouComponent } from './thank-you/thank-you.component';

@NgModule({
  imports: [CommonModule, PublicRoutingModule, ReactiveFormsModule, SharedModule],
  declarations: [FeedbackComponent, ContactUsOrLeaveFeedbackComponent, ThankYouComponent, PublicPageComponent],
})
export class PublicModule {}
