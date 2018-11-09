import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { EnterWorkplaceAddressComponent } from './enter-workplace-address.component';

import { EnterWorkplaceAddressRoutingModule } from './enter-workplace-address-routing.module';

@NgModule({
  imports: [
    EnterWorkplaceAddressRoutingModule
  ],
  declarations: [
   EnterWorkplaceAddressComponent
  ],
  providers: []
})
export class EnterWorkplaceModule { }
