import { AuthGuard } from '@core/services/auth-guard.service';
import { ChangePasswordComponent } from '@features/account-management/change-password/change-password.component';
import { ChangeUserSecurityComponent } from '@features/account-management/change-user-security/change-user-security.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YourAccountComponent } from '@features/account-management/your-account/your-account.component';

const routes: Routes = [
  {
    path: 'your-account',
    component: YourAccountComponent,
    canActivate: [AuthGuard],
    data: { title: 'Your Account' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Password' },
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Security Question' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountManagementRoutingModule {}
