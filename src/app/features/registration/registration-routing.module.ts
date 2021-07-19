import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterGuard } from '@core/guards/register/register.guard';
import { PageResolver } from '@core/resolvers/page.resolver';
import {
  SecurityQuestionComponent,
} from '@features/create-account/user/create-security-question/create-security-question.component';
import { UsernamePasswordComponent } from '@features/create-account/user/username-password/username-password.component';
import {
  FindWorkplaceAddressComponent,
} from '@features/create-account/workplace/find-workplace-address/find-workplace-address.component';
import { NameOfWorkplaceComponent } from '@features/create-account/workplace/name-of-workplace/name-of-workplace.component';
import {
  NewSelectMainServiceComponent,
} from '@features/create-account/workplace/new-select-main-service/new-select-main-service.component';
import {
  SelectWorkplaceAddressComponent,
} from '@features/create-account/workplace/select-workplace-address/select-workplace-address.component';
import { ThankYouComponent } from '@features/create-account/workplace/thank-you/thank-you.component';
import {
  WorkplaceNameAddressComponent,
} from '@features/create-account/workplace/workplace-name-address/workplace-name-address.component';
import { ChangeYourDetailsComponent } from '@features/registration/change-your-details/change-your-details.component';
import {
  ConfirmAccountDetailsComponent,
} from '@features/registration/confirm-account-details/confirm-account-details.component';
import {
  ConfirmWorkplaceDetailsComponent,
} from '@features/registration/confirm-workplace-details/confirm-workplace-details.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { RegulatedByCqcComponent } from '@features/registration/regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from '@features/registration/select-main-service/select-main-service.component';
import { SelectWorkplaceComponent } from '@features/registration/select-workplace/select-workplace.component';
import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';

import { FindYourWorkplaceComponent } from '../create-account/workplace/find-your-workplace/find-your-workplace.component';
import {
  IsThisYourWorkplaceComponent,
} from '../create-account/workplace/is-this-your-workplace/is-this-your-workplace.component';
import { NewRegulatedByCqcComponent } from '../create-account/workplace/new-regulated-by-cqc/new-regulated-by-cqc.component';
import {
  NewWorkplaceNotFoundComponent,
} from '../create-account/workplace/new-workplace-not-found/new-workplace-not-found.component';
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
    path: 'new-workplace-not-found',
    component: NewWorkplaceNotFoundComponent,
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
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Main Service' },
  },
  {
    path: 'new-select-main-service',
    component: NewSelectMainServiceComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Select Main Service' },
  },
  {
    path: 'find-workplace',
    component: NewRegulatedByCqcComponent,
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
    path: 'workplace-name-address',
    component: WorkplaceNameAddressComponent,
    canActivate: [RegisterGuard],
    data: { title: 'Workplace name and address?' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
