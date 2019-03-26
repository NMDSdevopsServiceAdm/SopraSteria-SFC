import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpInterceptor } from '@core/services/http-interceptor';
import { TermsConditionsComponent } from '@features/terms-conditions/terms-conditions.component';
import { SharedModule } from '@shared/shared.module';
import { MomentModule } from 'ngx-moment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './core/error/page-not-found/page-not-found.component';
import {
  ProblemWithTheServicePagesComponent,
} from './core/error/problem-with-the-service-pages/problem-with-the-service-pages.component';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';
import { AuthGuard } from './core/services/auth-guard.service';
import { AuthInterceptor } from './core/services/auth-interceptor';
import { CountryService } from './core/services/country.service';
import { EstablishmentService } from './core/services/establishment.service';
import { EthnicityService } from './core/services/ethnicity.service';
import { FeedbackService } from './core/services/feedback.service';
import { HttpErrorHandler } from './core/services/http-error-handler.service';
import { JobService } from './core/services/job.service';
import { LocalAuthorityService } from './core/services/localAuthority.service';
import { LocationService } from './core/services/location.service';
import { MessageService } from './core/services/message.service';
import { NationalityService } from './core/services/nationality.service';
import { QualificationService } from './core/services/qualification.service';
import { RecruitmentService } from './core/services/recruitment.service';
import { RegistrationService } from './core/services/registration.service';
import { WorkerService } from './core/services/worker.service';
import { ConfirmAccountDetailsComponent } from './features/confirm-account-details/confirm-account-details.component';
import { ConfirmLeaversComponent } from './features/confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './features/confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './features/confirm-vacancies/confirm-vacancies.component';
import { ConfirmWorkplaceDetailsComponent } from './features/confirm-workplace-details/confirm-workplace-details.component';
import { ContactUsComponent } from './features/contactUs/contactUs.component';
import { ContinueCreatingAccountComponent } from './features/continue-creating-account/continue-creating-account.component';
import {
  CqcRegisteredQuestionEditComponent,
} from './features/cqc-registered-question/cqc-registered-question-edit/cqc-registered-question-edit.component';
import { CqcRegisteredQuestionComponent } from './features/cqc-registered-question/cqc-registered-question.component';
import { CreateUsernameComponent } from './features/create-username/create-username.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StaffRecordsTabComponent } from './features/dashboard/staff-records-tab/staff-records-tab.component';
import { EnterWorkplaceAddressComponent } from './features/enter-workplace-address/enter-workplace-address.component';
import { FeedbackComponent } from './features/feedback/feedback.component';
import {
  ForgotYourPasswordConfirmationComponent,
} from './features/forgot-your-password/confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from './features/forgot-your-password/edit/edit.component';
import { ForgotYourPasswordComponent } from './features/forgot-your-password/forgot-your-password.component';
import { LeaversComponent } from './features/leavers/leavers.component';
import { LoginComponent } from './features/login/login.component';
import { LogoutComponent } from './features/logout/logout.component';
import { RegisterComponent } from './features/register/register.component';
import { RegistrationCompleteComponent } from './features/registration-complete/registration-complete.component';
import { ResetPasswordConfirmationComponent } from './features/reset-password/confirmation/confirmation.component';
import { ResetPasswordEditComponent } from './features/reset-password/edit/edit.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { SecurityQuestionComponent } from './features/security-question/security-question.component';
import { SelectMainServiceComponent } from './features/select-main-service/select-main-service.component';
import { SelectOtherServicesComponent } from './features/select-other-services/select-other-services.component';
import { SelectWorkplaceAddressComponent } from './features/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from './features/select-workplace/select-workplace.component';
import { ServicesCapacityComponent } from './features/services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from './features/shareLocalAuthorities/shareLocalAuthority.component';
import { ShareOptionsComponent } from './features/shareOptions/shareOptions.component';
import { SharingComponent } from './features/sharing/sharing.component';
import { StartersComponent } from './features/starters/starters.component';
import { TypeOfEmployerComponent } from './features/type-of-employer/type-of-employer.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';
import { VacanciesComponent } from './features/vacancies/vacancies.component';
import { ChangeUserSummaryComponent } from './features/change-user-summary/change-user-summary.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ChangePasswordConfirmationComponent } from './features/change-password/confirmation/confirmation.component';
import { ChangePasswordEditComponent } from './features/change-password/edit/edit.component';
import { ChangeUserDetailsComponent } from './features/change-user-details/change-user-details.component';
import { ChangeUserSecurityComponent } from './features/change-user-security/change-user-security.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    CqcRegisteredQuestionComponent,
    CqcRegisteredQuestionEditComponent,
    ConfirmWorkplaceDetailsComponent,
    SelectWorkplaceComponent,
    SelectWorkplaceAddressComponent,
    UserDetailsComponent,
    CreateUsernameComponent,
    SecurityQuestionComponent,
    ConfirmAccountDetailsComponent,
    RegistrationCompleteComponent,
    EnterWorkplaceAddressComponent,
    SelectMainServiceComponent,
    ContinueCreatingAccountComponent,
    SelectOtherServicesComponent,
    TypeOfEmployerComponent,
    VacanciesComponent,
    ConfirmVacanciesComponent,
    StartersComponent,
    ConfirmStartersComponent,
    LeaversComponent,
    ConfirmLeaversComponent,
    ServicesCapacityComponent,
    SharingComponent,
    ShareLocalAuthorityComponent,
    ShareOptionsComponent,
    FeedbackComponent,
    ContactUsComponent,
    LogoutComponent,
    PageNotFoundComponent,
    ProblemWithTheServicePagesComponent,
    TermsConditionsComponent,
    DashboardComponent,
    StaffRecordsTabComponent,
    ForgotYourPasswordComponent,
    ForgotYourPasswordConfirmationComponent,
    ForgotYourPasswordEditComponent,
    ResetPasswordComponent,
    ResetPasswordEditComponent,
    ResetPasswordConfirmationComponent,
    ChangeUserSummaryComponent,
    ChangePasswordComponent,
    ChangePasswordConfirmationComponent,
    ChangePasswordEditComponent,
    ChangeUserDetailsComponent,
    ChangeUserSecurityComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
    ]),
    SharedModule,
    MomentModule,
  ],
  providers: [
    LocationService,
    RegistrationService,
    JobService,
    QualificationService,
    MessageService,
    HttpErrorHandler,
    FeedbackService,
    EstablishmentService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    LocalAuthorityService,
    AuthGuard,
    WorkerService,
    EthnicityService,
    RecruitmentService,
    NationalityService,
    CountryService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
