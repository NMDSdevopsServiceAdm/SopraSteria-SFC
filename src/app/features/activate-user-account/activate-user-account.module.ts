import { CommonModule } from '@angular/common';
import { ConfirmAccountDetailsComponent } from './confirm-account-details/confirm-account-details.component';
import { ActivateUserAccountRoutingModule } from '@features/activate-user-account/activate-user-account-routing.module';
import { CreateUsernameComponent } from './create-username/create-username.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SecurityQuestionComponent } from './security-question/security-question.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, ActivateUserAccountRoutingModule],
  declarations: [ConfirmAccountDetailsComponent, CreateUsernameComponent, SecurityQuestionComponent],
})
export class ActivateUserAccountModule {}
