import { ChangePasswordComponent } from '@features/account-management/change-password/change-password.component';
import { ChangeUserSecurityComponent } from '@features/account-management/change-user-security/change-user-security.component';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YourAccountComponent } from '@features/account-management/your-account/your-account.component';

const routes: Routes = [
  {
    path: 'your-account',
    component: YourAccountComponent,
    data: { title: 'Your Account' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    data: { title: 'Change Password' },
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    data: { title: 'Change Security Question' },
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    data: { title: 'Change Your Details' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountManagementRoutingModule {}
