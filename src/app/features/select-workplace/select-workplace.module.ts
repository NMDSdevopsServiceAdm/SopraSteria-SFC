import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { SelectWorkplaceComponent } from './select-workplace.component';

import { SelectWorkplaceRoutingModule } from './select-workplace-routing.module';

@NgModule({
  imports: [
    SelectWorkplaceRoutingModule
  ],
  declarations: [
    SelectWorkplaceComponent
  ],
  providers: []
})
export class SelectWorkplaceModule { }
