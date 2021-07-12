import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterGuard } from '@core/guards/register/register.guard';
import { PageResolver } from '@core/resolvers/page.resolver';
import { NameOfWorkplaceComponent } from '@features/create-account/workplace/name-of-workplace/name-of-workplace.component';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import { ConfirmAccountDetailsComponent } from '@features/registration/confirm-account-details/confirm-account-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/registration/confirm-workplace-details/confirm-workplace-details.component';
import { CreateUsernameComponent } from '@features/registration/create-username/create-username.component';
import { EnterWorkplaceAddressComponent } from '@features/registration/enter-workplace-address/enter-workplace-address.component';
import { FindWorkplaceAddressComponent } from '@features/registration/find-workplace-address/find-workplace-address.component';
import { RegistrationAwaitingApprovalComponent } from '@features/registration/registration-awaiting-approval/registration-awaiting-approval.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { RegulatedByCqcComponent } from '@features/registration/regulated-by-cqc/regulated-by-cqc.component';
import { SecurityQuestionComponent } from '@features/registration/security-question/security-question.component';
import { SelectMainServiceComponent } from '@features/registration/select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from '@features/registration/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/registration/select-workplace/select-workplace.component';
import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';

import { FindYourWorkplaceComponent } from '../create-account/workplace/find-your-workplace/find-your-workplace.component';
import { IsThisYourWorkplaceComponent } from '../create-account/workplace/is-this-your-workplace/is-this-your-workplace.component';
import { NewRegulatedByCqcComponent } from '../create-account/workplace/new-regulated-by-cqc/new-regulated-by-cqc.component';
import { AboutUsRegistrationComponent } from './about-us/about-us.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

const routes: Routes = [
  {
    path: 'start',
    redirectTo: 'create-account',
  },
  {
    path: 'create-account',
    component: CreateAccountComponent,
    data: { title: 'Create Account' },
  },
  {
    path: 'about-ascwds',
    component: AboutUsRegistrationComponent,
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'regulated-by-cqc',
    component: RegulatedByCqcComponent,
    data: { title: 'Regulated by CQC' },
  },
  {
    path: 'find-workplace',
    component: FindYourWorkplaceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Find your workplace' },
  },
  {
    path: 'your-workplace',
    component: IsThisYourWorkplaceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Is this your workplace?' },
  },
  {
    path: 'new-regulated-by-cqc',
    component: NewRegulatedByCqcComponent,
    data: { title: 'Service regulated by CQC?' },
  },
  {
    path: 'workplace-not-found',
    component: WorkplaceNotFoundComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Workplace Not Found' },
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Workplace' },
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Confirm Workplace Details' },
  },
  {
    path: 'your-details',
    component: YourDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Your Details' },
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Change Your Details' },
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Create Username' },
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Security Question' },
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Confirm Account Details' },
  },
  {
    path: 'complete',
    component: RegistrationCompleteComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Complete' },
  },
  {
    path: 'awaiting-approval',
    component: RegistrationAwaitingApprovalComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Awaiting Approval' },
  },
  {
    path: 'find-workplace-address',
    component: FindWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Find Workplace Address' },
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Workplace Address' },
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Enter Workplace Address' },
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Main Service' },
  },
  {
    path: 'workplace-name',
    component: NameOfWorkplaceComponent,
    canActivate: [RegisterGuard],
    data: { title: `What's the name of your workplace?` },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
