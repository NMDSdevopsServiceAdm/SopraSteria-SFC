import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CqcRegisteredQuestionComponent,
} from './cqc-registered-question.component';

import { CqcRegisteredQuestionRoutingModule } from './cqc-registered-question-routing.module';

@NgModule({
  imports: [
    CqcRegisteredQuestionRoutingModule
  ],
  declarations: [
    CqcRegisteredQuestionComponent
  ],
  providers: [
  ]
})
export class CqcRegisteredQuestionModule { }
