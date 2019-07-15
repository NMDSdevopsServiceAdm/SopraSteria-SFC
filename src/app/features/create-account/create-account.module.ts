import { CommonModule } from '@angular/common';
import { ConfirmAccountDetailsComponent } from './confirm-account-details/confirm-account-details.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { CreateAccountRoutingModule } from '@features/create-account/create-account-routing.module';
import { CreateUsernameComponent } from './create-username/create-username.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, CreateAccountRoutingModule],
  declarations: [
    ConfirmAccountDetailsComponent,
    CreateAccountComponent,
    CreateUsernameComponent,
    SecurityQuestionComponent,
  ],
})
export class CreateAccountModule {}
