import { AccountManagementRoutingModule } from '@features/account-management/account-management-routing.module';
import { ChangePasswordComponent } from '@features/account-management/change-password/change-password.component';
import { ChangePasswordConfirmationComponent } from '@features/account-management/change-password/confirmation/confirmation.component';
import { ChangePasswordEditComponent } from '@features/account-management/change-password/edit/edit.component';
import { ChangeUserSecurityComponent } from '@features/account-management/change-user-security/change-user-security.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { YourAccountComponent } from '@features/account-management/your-account/your-account.component';
import { ChangeYourDetailsComponent } from './change-your-details/change-your-details.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AccountManagementRoutingModule],
  declarations: [
    ChangePasswordComponent,
    ChangePasswordConfirmationComponent,
    ChangePasswordEditComponent,
    ChangeUserSecurityComponent,
    YourAccountComponent,
    ChangeYourDetailsComponent,
  ]
})
export class AccountManagementModule {}
