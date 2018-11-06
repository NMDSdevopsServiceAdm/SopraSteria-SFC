import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { SecurityQuestionComponent } from './security-question.component';

import { SecurityQuestionRoutingModule } from './security-question-routing.module';

@NgModule({
  imports: [
    SecurityQuestionRoutingModule
  ],
  declarations: [
    SecurityQuestionComponent
  ],
  providers: []
})
export class SecurityQuestionModule { }
