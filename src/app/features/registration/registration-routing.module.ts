import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CannotCreateAccountComponent } from '@core/components/error/cannot-create-account/cannot-create-account.component';
import { RegisterGuard } from '@core/guards/register/register.guard';
import { PageResolver } from '@core/resolvers/page.resolver';
import { ConfirmAccountDetailsComponent } from '@features/create-account/user/confirm-account-details/confirm-account-details.component';
import { SecurityQuestionComponent } from '@features/create-account/user/create-security-question/create-security-question.component';
import { UsernamePasswordComponent } from '@features/create-account/user/username-password/username-password.component';
import { YourDetailsComponent } from '@features/create-account/user/your-details/your-details.component';
import { AddTotalStaffComponent } from '@features/create-account/workplace/add-total-staff/add-total-staff.component';
import { ConfirmDetailsComponent } from '@features/create-account/workplace/confirm-details/confirm-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/create-account/workplace/confirm-workplace-details/confirm-workplace-details.component';
import { CouldNotFindWorkplaceAddressComponent } from '@features/create-account/workplace/could-not-find-workplace-address/could-not-find-workplace-address.component';
import { FindWorkplaceAddressComponent } from '@features/create-account/workplace/find-workplace-address/find-workplace-address.component';
import { NameOfWorkplaceComponent } from '@features/create-account/workplace/name-of-workplace/name-of-workplace.component';
import { SelectMainServiceComponent } from '@features/create-account/workplace/select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from '@features/create-account/workplace/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/create-account/workplace/select-workplace/select-workplace.component';
import { ThankYouComponent } from '@features/create-account/workplace/thank-you/thank-you.component';
import { TypeOfEmployerComponent } from '@features/create-account/workplace/type-of-employer/type-of-employer.component';
import { WorkplaceNameAddressComponent } from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';

import { FindYourWorkplaceComponent } from '../create-account/workplace/find-your-workplace/find-your-workplace.component';
import { IsThisYourWorkplaceComponent } from '../create-account/workplace/is-this-your-workplace/is-this-your-workplace.component';
import { RegulatedByCqcComponent } from '../create-account/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { WorkplaceNotFoundComponent } from '../create-account/workplace/workplace-not-found/workplace-not-found.component';
import { AboutUsRegistrationComponent } from './about-us/about-us.component';
import { CreateAccountComponent } from './create-account/create-account.component';

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
    path: 'regulated-by-cqc',
    component: RegulatedByCqcComponent,
    data: { title: 'Service regulated by CQC?' },
  },
  {
    path: 'workplace-not-found',
    component: WorkplaceNotFoundComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Could not find your workplace' },
  },
  {
    path: 'workplace-address-not-found',
    component: CouldNotFindWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Could not find your workplace address' },
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
    path: 'username-password',
    component: UsernamePasswordComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Create your username and password' },
  },
  {
    path: 'create-security-question',
    component: SecurityQuestionComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Create your security question' },
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Confirm Account Details' },
  },
  {
    path: 'confirm-details',
    children: [
      {
        path: '',
        component: ConfirmDetailsComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Confirm Details' },
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
        path: 'workplace-not-found',
        component: WorkplaceNotFoundComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Could not find your workplace' },
      },
      {
        path: 'select-workplace',
        component: SelectWorkplaceComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Select Workplace' },
      },
      {
        path: 'workplace-name-address',
        component: WorkplaceNameAddressComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Workplace name and address?' },
      },
      {
        path: 'type-of-employer',
        component: TypeOfEmployerComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Type of Employer' },
      },
      {
        path: 'cannot-create-account',
        component: CannotCreateAccountComponent,
        data: { title: 'Cannot create account', flow: 'registration' },
      },
      {
        path: 'select-workplace-address',
        component: SelectWorkplaceAddressComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Select Workplace Address' },
      },
      {
        path: 'create-security-question',
        component: SecurityQuestionComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Create your security question' },
      },
      {
        path: 'add-user-details',
        component: YourDetailsComponent,
        canActivate: [RegisterGuard],
        data: { title: 'Add your user details' },
      },
    ],
  },
  {
    path: 'complete',
    component: RegistrationCompleteComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Complete' },
  },
  {
    path: 'thank-you',
    component: ThankYouComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Thank you' },
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
    path: 'type-of-employer',
    component: TypeOfEmployerComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Type of Employer' },
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Main Service' },
  },
  {
    path: 'add-total-staff',
    component: AddTotalStaffComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Add Total Staff' },
  },
  {
    path: 'find-workplace',
    component: RegulatedByCqcComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Find your workplace' },
  },
  {
    path: 'workplace-name',
    component: NameOfWorkplaceComponent,
    canActivate: [RegisterGuard],
    data: { title: `What's the name of your workplace?` },
  },
  {
    path: 'add-user-details',
    component: YourDetailsComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Add your user details' },
  },
  {
    path: 'workplace-name-address',
    component: WorkplaceNameAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Workplace name and address?' },
  },
  {
    path: 'cannot-create-account',
    component: CannotCreateAccountComponent,
    data: { title: 'Cannot create account', flow: 'registration' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
