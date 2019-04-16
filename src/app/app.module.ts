import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ProblemWithTheServiceComponent,
} from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ServiceUnavailableComponent } from '@core/components/error/service-unavailable/service-unavailable.component';
import { FooterComponent } from '@core/components/footer/footer.component';
import { HeaderComponent } from '@core/components/header/header.component';
import { HttpInterceptor } from '@core/services/http-interceptor';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { TermsConditionsComponent } from '@features/terms-conditions/terms-conditions.component';
import { SharedModule } from '@shared/shared.module';
import { MomentModule } from 'ngx-moment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ChangePasswordConfirmationComponent } from './features/change-password/confirmation/confirmation.component';
import { ChangePasswordEditComponent } from './features/change-password/edit/edit.component';
import { ChangeUserDetailsComponent } from './features/change-user-details/change-user-details.component';
import { ChangeUserSecurityComponent } from './features/change-user-security/change-user-security.component';
import { YourAccountComponent } from './features/your-account/your-account.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeTabComponent } from './features/dashboard/home-tab/home-tab.component';
import { StaffRecordsTabComponent } from './features/dashboard/staff-records-tab/staff-records-tab.component';
import { WorkplaceTabComponent } from './features/dashboard/workplace-tab/workplace-tab.component';
import { FeedbackComponent } from './features/feedback/feedback.component';
import {
  ForgotYourPasswordConfirmationComponent,
} from './features/forgot-your-password/confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from './features/forgot-your-password/edit/edit.component';
import { ForgotYourPasswordComponent } from './features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from './features/login/login.component';
import { LogoutComponent } from './features/logout/logout.component';
import { RegisterComponent } from './features/register/register.component';
import { ResetPasswordConfirmationComponent } from './features/reset-password/confirmation/confirmation.component';
import { ResetPasswordEditComponent } from './features/reset-password/edit/edit.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    FeedbackComponent,
    ContactUsComponent,
    LogoutComponent,
    PageNotFoundComponent,
    ProblemWithTheServiceComponent,
    ServiceUnavailableComponent,
    TermsConditionsComponent,
    DashboardComponent,
    StaffRecordsTabComponent,
    ForgotYourPasswordComponent,
    ForgotYourPasswordConfirmationComponent,
    ForgotYourPasswordEditComponent,
    ResetPasswordComponent,
    ResetPasswordEditComponent,
    ResetPasswordConfirmationComponent,
    YourAccountComponent,
    ChangePasswordComponent,
    ChangePasswordConfirmationComponent,
    ChangePasswordEditComponent,
    ChangeUserDetailsComponent,
    ChangeUserSecurityComponent,
    HomeTabComponent,
    WorkplaceTabComponent,
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
    ], { anchorScrolling: 'enabled' }),
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
    TrainingService,
    WindowRef,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
