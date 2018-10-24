import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  LoginComponent,
} from './login.component';

import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  imports: [
    LoginRoutingModule
  ],
  declarations: [
    LoginComponent
  ],
  providers: [

  ]
})
export class RegisterModule { }
