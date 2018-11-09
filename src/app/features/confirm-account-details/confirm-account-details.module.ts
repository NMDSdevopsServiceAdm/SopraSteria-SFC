import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

import {ConfirmAccountDetailsRoutingModule } from './confirm-account-details-routing.module';

@NgModule({
  imports: [
    ConfirmAccountDetailsRoutingModule
  ],
  declarations: [
    ConfirmAccountDetailsComponent
  ],
  providers: []
})
export class ConfirmAccountDetailsModule { }
