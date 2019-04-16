import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CqcRegisteredQuestionComponent } from '@features/registration/cqc-registered-question/cqc-registered-question.component';
import { SelectWorkplaceComponent } from '@features/registration/select-workplace/select-workplace.component';
import { RegisterGuard } from '@core/guards/register/register.guard';
import { ConfirmWorkplaceDetailsComponent } from '@features/registration/confirm-workplace-details/confirm-workplace-details.component';
import { UserDetailsComponent } from '@features/registration/user-details/user-details.component';
import { CreateUsernameComponent } from '@features/registration/create-username/create-username.component';
import { SecurityQuestionComponent } from '@features/registration/security-question/security-question.component';
import { ConfirmAccountDetailsComponent } from '@features/registration/confirm-account-details/confirm-account-details.component';
import { RegistrationCompleteComponent } from '@features/registration/registration-complete/registration-complete.component';
import { SelectWorkplaceAddressComponent } from '@features/registration/select-workplace-address/select-workplace-address.component';
import { EnterWorkplaceAddressComponent } from '@features/registration/enter-workplace-address/enter-workplace-address.component';
import { SelectMainServiceComponent } from '@features/registration/select-main-service/select-main-service.component';

const routes: Routes = [
  {
    path: 'registered-question',
    component: CqcRegisteredQuestionComponent,
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'registration-complete',
    component: RegistrationCompleteComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent,
    canActivate: [RegisterGuard],
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    canActivate: [RegisterGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
