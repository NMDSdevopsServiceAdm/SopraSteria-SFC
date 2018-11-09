import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { SelectMainServiceComponent } from './select-main-service.component';

import { SelectMainServiceRoutingModule } from './select-main-service-routing.module';

@NgModule({
  imports: [
    SelectMainServiceRoutingModule
  ],
  declarations: [
    SelectMainServiceComponent
  ],
  providers: []
})
export class SelectMainServiceModule { }
