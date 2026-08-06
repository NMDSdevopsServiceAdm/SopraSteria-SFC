import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountManagementRoutingModule } from '@features/account-management/account-management-routing.module';
import { ChangePasswordComponent } from '@features/account-management/change-password/change-password.component';
import { ChangePasswordEditComponent } from '@features/account-management/change-password/edit/edit.component';
import { ChangeUserResearchComponent } from '@features/account-management/change-user-research/change-user-research.component';
import { ChangeUserSecurityComponent } from '@features/account-management/change-user-security/change-user-security.component';
import { ChangeYourDetailsComponent } from '@features/account-management/change-your-details/change-your-details.component';
import { YourAccountComponent } from '@features/account-management/your-account/your-account.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AccountManagementRoutingModule],
  declarations: [
    ChangePasswordComponent,
    ChangePasswordEditComponent,
    ChangeUserSecurityComponent,
    YourAccountComponent,
    ChangeYourDetailsComponent,
    ChangeUserResearchComponent,
  ],
})
export class AccountManagementModule {}
