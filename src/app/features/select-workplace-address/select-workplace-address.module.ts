import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

import { SelectWorkplaceAddressRoutingModule } from './select-workplace-address-routing.module';

@NgModule({
  imports: [
    SelectWorkplaceAddressRoutingModule
  ],
  declarations: [
    SelectWorkplaceAddressComponent
  ],
  providers: []
})
export class SelectWorkplaceModule { }
