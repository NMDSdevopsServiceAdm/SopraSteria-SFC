import { CommonModule } from '@angular/common';
import { ConfirmAccountDetailsComponent } from './confirm-account-details/confirm-account-details.component';
import { CreateUserAccountComponent } from './create-user-account/create-user-account.component';
import { CreateAccountRoutingModule } from '@features/create-account/create-account-routing.module';
import { CreateUsernameComponent } from './create-username/create-username.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { SharedModule } from '@shared/shared.module';
import { AccountSavedComponent } from './account-saved/account-saved.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, CreateAccountRoutingModule],
  declarations: [
    ConfirmAccountDetailsComponent,
    CreateUserAccountComponent,
    CreateUsernameComponent,
    SecurityQuestionComponent,
    AccountSavedComponent,
  ],
})
export class CreateAccountModule {}
