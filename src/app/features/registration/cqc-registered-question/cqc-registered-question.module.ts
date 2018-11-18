import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

//import { LocationService } from '../../../core/services/location.service';

import { CqcRegisteredQuestionComponent } from './cqc-registered-question.component';
import { CqcRegisteredQuestionEditComponent } from './cqc-registered-question-edit/cqc-registered-question-edit.component';

import { CqcRegisteredQuestionRoutingModule } from './cqc-registered-question-routing.module';


@NgModule({
  imports: [
    CqcRegisteredQuestionRoutingModule
  ],
  declarations: [
    CqcRegisteredQuestionComponent,
    CqcRegisteredQuestionEditComponent
  ],
  providers: [
    //LocationService
  ]
})
export class CqcRegisteredQuestionModule { }
