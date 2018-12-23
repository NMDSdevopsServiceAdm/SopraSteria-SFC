import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { LoginComponent } from './features/login/login.component';
//import { RegisterComponent } from './features/register/register.component';
import { CqcRegisteredQuestionComponent } from './features/cqc-registered-question/cqc-registered-question.component';
import { SelectWorkplaceComponent } from './features/select-workplace/select-workplace.component';
import { ConfirmWorkplaceDetailsComponent } from './features/confirm-workplace-details/confirm-workplace-details.component';
import { SelectWorkplaceAddressComponent } from './features/select-workplace-address/select-workplace-address.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';
import { CreateUsernameComponent } from './features/create-username/create-username.component';
import { SecurityQuestionComponent } from './features/security-question/security-question.component';
import { ConfirmAccountDetailsComponent } from './features/confirm-account-details/confirm-account-details.component';
import { RegistrationCompleteComponent } from './features/registration-complete/registration-complete.component';
import { EnterWorkplaceAddressComponent } from './features/enter-workplace-address/enter-workplace-address.component';
import { SelectMainServiceComponent } from './features/select-main-service/select-main-service.component';
import { ContinueCreatingAccountComponent } from './features/continue-creating-account/continue-creating-account.component';
import { VacanciesComponent } from "./features/vacancies/vacancies.component";
import { ConfirmVacanciesComponent } from "./features/confirm-vacancies/confirm-vacancies.component"
import { AddNewStartersComponent } from "./features/add-new-starters/add-new-starters.component"


const routes: Routes = [

  {
    path: 'registered-question',
    component: CqcRegisteredQuestionComponent,
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent
  },
  {
    path: 'user-details',
    component: UserDetailsComponent
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent
  },
  {
    path: 'security-question',
    component: SecurityQuestionComponent
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent
  },
  {
    path: 'registration-complete',
    component: RegistrationCompleteComponent
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent
  },
  {
    path: 'continue-creating-account',
    component: ContinueCreatingAccountComponent
  },
  {
    path: 'vacancies',
    component: VacanciesComponent
  },
  {
    path: 'confirm-vacancies',
    component: ConfirmVacanciesComponent
  },
  {
    path: 'add-new-starters',
    component: AddNewStartersComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
