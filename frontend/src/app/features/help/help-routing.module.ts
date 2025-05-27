import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpPageResolver } from '@core/resolvers/help-pages.resolver';
import { QuestionAndAnswerPageResolver } from '@core/resolvers/help/question-and-answer-page/question-and-answer-page.resolver';
import { QuestionsAndAnswersResolver } from '@core/resolvers/help/questions-and-answers/questions-and-answers.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';

import { ContactUsComponent } from './contact-us/contact-us.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { QAndAPageComponent } from './q-and-a-page/q-and-a-page.component';
import { QuestionsAndAnswersComponent } from './questions-and-answers/questions-and-answers.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { HelpfulDownloadsComponent } from './helpful-downloads/helpful-downloads.component';

const routes: Routes = [
  {
    path: '',
    component: HelpAreaComponent,
    children: [
      {
        path: 'get-started',
        component: GetStartedComponent,
        resolve: {
          wizard: WizardResolver,
        },
        data: { title: 'Get started' },
      },
      {
        path: 'questions-and-answers',
        component: QuestionsAndAnswersComponent,
        resolve: {
          questionsAndAnswers: QuestionsAndAnswersResolver,
        },
        data: { title: 'Questions and answers' },
      },
      {
        path: 'questions-and-answers/:slug',
        component: QAndAPageComponent,
        data: { title: 'Question and answer' },
        resolve: {
          questionAndAnswerPage: QuestionAndAnswerPageResolver,
        },
      },
      {
        path: 'whats-new',
        component: WhatsNewComponent,
        resolve: {
          helpPage: HelpPageResolver,
        },
        data: { title: "What's new" },
      },
      {
        path: 'helpful-downloads',
        component: HelpfulDownloadsComponent,
        resolve: {
          page: HelpPageResolver,
        },
        data: { title: "Helpful Downloads"},
      },
      {
        path: 'contact-us',
        component: ContactUsComponent,
        resolve: {
          page: PageResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
