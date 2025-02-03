import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpPageResolver } from '@core/resolvers/help-pages.resolver';
import {
  QuestionAndAnswerPageResolver,
} from '@core/resolvers/help/question-and-answer-page/question-and-answer-page.resolver';
import { QuestionsAndAnswersResolver } from '@core/resolvers/help/questions-and-answers/questions-and-answers.resolver';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';

import { GetStartedComponent } from './get-started/get-started.component';
import { HelpAreaComponent } from './help-area/help-area.component';
import { QAndAPageComponent } from './q-and-a-page/q-and-a-page.component';
import { QuestionsAndAnswersComponent } from './questions-and-answers/questions-and-answers.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
