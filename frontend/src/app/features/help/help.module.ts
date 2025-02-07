import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionAndAnswerPageResolver } from '@core/resolvers/help/question-and-answer-page/question-and-answer-page.resolver';
import { SharedModule } from '@shared/shared.module';

import { ContactUsComponent } from './contact-us/contact-us.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { HelpRoutingModule } from './help-routing.module';
import { QAndAPageComponent } from './q-and-a-page/q-and-a-page.component';
import { QuestionsAndAnswersComponent } from './questions-and-answers/questions-and-answers.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { HelpfulDownloadsComponent } from './helpful-downloads/helpful-downloads.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, HelpRoutingModule],
  declarations: [
    HelpAreaComponent,
    GetStartedComponent,
    HelpfulDownloadsComponent,
    QuestionsAndAnswersComponent,
    WhatsNewComponent,
    QAndAPageComponent,
    ContactUsComponent,
  ],
  providers: [QuestionAndAnswerPageResolver],
})
export class HelpModule {}
