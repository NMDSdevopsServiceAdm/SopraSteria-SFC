import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { LocationService } from '../../core/services/location.service';

import { CqcRegisteredQuestionComponent } from './cqc-registered-question.component';

import { CqcRegisteredQuestionRoutingModule } from './cqc-registered-question-routing.module';

@NgModule({
  imports: [
    CqcRegisteredQuestionRoutingModule
  ],
  declarations: [
    CqcRegisteredQuestionComponent
  ],
  providers: [
    LocationService
  ]
})
export class CqcRegisteredQuestionModule { }
