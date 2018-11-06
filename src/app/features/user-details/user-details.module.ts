import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { UserDetailsComponent } from './user-details.component';

import { UserDetailsRoutingModule } from './user-details-routing.module';

@NgModule({
  imports: [
    UserDetailsRoutingModule
  ],
  declarations: [
    UserDetailsComponent
  ],
  providers: []
})
export class UserDetailsModule { }
