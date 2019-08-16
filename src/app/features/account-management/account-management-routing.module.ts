import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChangeUserSecurityComponent } from './change-user-security/change-user-security.component';
import { ChangeYourDetailsComponent } from './change-your-details/change-your-details.component';
import { YourAccountComponent } from './your-account/your-account.component';

const routes: Routes = [
  {
    path: '',
    component: YourAccountComponent,
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    data: { title: 'Your password' },
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    data: { title: 'Your security question' },
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    data: { title: 'Your details' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountManagementRoutingModule {}
