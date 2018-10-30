import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  RegisterComponent,
} from './register.component';

import { RegisterRoutingModule } from './register-routing.module';

@NgModule({
  imports: [
    RegisterRoutingModule
  ],
  declarations: [
    RegisterComponent
  ],
  providers: [
  ]
})
export class RegisterModule { }
