import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { CreateUsernameComponent } from './create-username.component';

import { CreateUsernameRoutingModule } from './create-username-routing.module';

@NgModule({
  imports: [
    CreateUsernameRoutingModule
  ],
  declarations: [
    CreateUsernameComponent
  ],
  providers: []
})
export class CreateUsernameModule { }
