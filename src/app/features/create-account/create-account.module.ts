import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateAccountRoutingModule } from '@features/create-account/create-account-routing.module';
import { SharedModule } from '@shared/shared.module';
import { CreateAccountComponent } from './create-account/create-account.component';

@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, SharedModule, CreateAccountRoutingModule
  ],
  declarations: [CreateAccountComponent]
})
export class CreateAccountModule { }
