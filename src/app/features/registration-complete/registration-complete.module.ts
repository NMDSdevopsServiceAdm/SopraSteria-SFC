import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { RegistrationCompleteComponent } from './registration-complete.component';

import { RegistrationCompleteRoutingModule } from './registration-complete-routing.module';

@NgModule({
  imports: [
    RegistrationCompleteRoutingModule
  ],
  declarations: [
    RegistrationCompleteComponent
  ],
  providers: []
})
export class SelectWorkplaceModule { }
