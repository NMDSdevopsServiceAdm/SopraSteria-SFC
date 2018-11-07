import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

import { ConfirmWorkplaceDetailsRoutingModule } from './confirm-workplace-details-routing.module';

@NgModule({
  imports: [
    ConfirmWorkplaceDetailsRoutingModule
  ],
  declarations: [
    ConfirmWorkplaceDetailsComponent
  ],
  providers: []
})
export class ConfirmWorkplaceDetailsModule { }
