import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServiceComponent,
} from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ServiceUnavailableComponent } from '@core/components/error/service-unavailable/service-unavailable.component';
import { RegisterGuard } from '@core/guards/register/register.guard';
import { AuthGuard } from '@core/services/auth-guard.service';
import { ChangePasswordComponent } from '@features/change-password/change-password.component';
import { ChangeUserDetailsComponent } from '@features/change-user-details/change-user-details.component';
import { ChangeUserSecurityComponent } from '@features/change-user-security/change-user-security.component';
import { ChangeUserSummaryComponent } from '@features/change-user-summary/change-user-summary.component';
import { ConfirmAccountDetailsComponent } from '@features/confirm-account-details/confirm-account-details.component';
import { ConfirmLeaversComponent } from '@features/confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from '@features/confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from '@features/confirm-vacancies/confirm-vacancies.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/confirm-workplace-details/confirm-workplace-details.component';
import { ContactUsComponent } from '@features/contactUs/contactUs.component';
import { ContinueCreatingAccountComponent } from '@features/continue-creating-account/continue-creating-account.component';
import { CqcRegisteredQuestionComponent } from '@features/cqc-registered-question/cqc-registered-question.component';
import { CreateUsernameComponent } from '@features/create-username/create-username.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { EnterWorkplaceAddressComponent } from '@features/enter-workplace-address/enter-workplace-address.component';
import { FeedbackComponent } from '@features/feedback/feedback.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LeaversComponent } from '@features/leavers/leavers.component';
import { LoginComponent } from '@features/login/login.component';
import { RegistrationCompleteComponent } from '@features/registration-complete/registration-complete.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { SecurityQuestionComponent } from '@features/security-question/security-question.component';
import { SelectMainServiceComponent } from '@features/select-main-service/select-main-service.component';
import { SelectOtherServicesComponent } from '@features/select-other-services/select-other-services.component';
import { SelectWorkplaceAddressComponent } from '@features/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/select-workplace/select-workplace.component';
import { ServicesCapacityComponent } from '@features/services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from '@features/shareLocalAuthorities/shareLocalAuthority.component';
import { ShareOptionsComponent } from '@features/shareOptions/shareOptions.component';
import { StartersComponent } from '@features/starters/starters.component';
import { TermsConditionsComponent } from '@features/terms-conditions/terms-conditions.component';
import { TypeOfEmployerComponent } from '@features/type-of-employer/type-of-employer.component';
import { UserDetailsComponent } from '@features/user-details/user-details.component';
import { VacanciesComponent } from '@features/vacancies/vacancies.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-your-password',
    component: ForgotYourPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'change-user-summary',
    component: ChangeUserSummaryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-user-details',
    component: ChangeUserDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-user-security',
    component: ChangeUserSecurityComponent,
    canActivate: [AuthGuard],
  },
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
  {
    path: 'continue-creating-account',
    component: ContinueCreatingAccountComponent,
  },
  {
    path: 'select-other-services',
    component: SelectOtherServicesComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'type-of-employer',
    component: TypeOfEmployerComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'vacancies',
    component: VacanciesComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-vacancies',
    component: ConfirmVacanciesComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'starters',
    component: StartersComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-starters',
    component: ConfirmStartersComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'leavers',
    component: LeaversComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-leavers',
    component: ConfirmLeaversComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'capacity-of-services',
    component: ServicesCapacityComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'share-local-authority',
    component: ShareLocalAuthorityComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'share-options',
    component: ShareOptionsComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'terms-and-conditions',
    component: TermsConditionsComponent,
  },
  {
    path: 'problem-with-the-service',
    component: ProblemWithTheServiceComponent,
  },
  {
    path: 'service-unavailable',
    component: ServiceUnavailableComponent,
  },
  {
    path: 'worker',
    loadChildren: '@features/workers/workers.module#WorkersModule',
    canLoad: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
