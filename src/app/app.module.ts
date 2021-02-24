import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '@core/components/error/page-not-found/page-not-found.component';
import { ProblemWithTheServiceComponent } from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ServiceUnavailableComponent } from '@core/components/error/service-unavailable/service-unavailable.component';
import { FooterComponent } from '@core/components/footer/footer.component';
import { HeaderComponent } from '@core/components/header/header.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { AuthInterceptor } from '@core/services/auth-interceptor';
import { BackService } from '@core/services/back.service';
import { CountryService } from '@core/services/country.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { EthnicityService } from '@core/services/ethnicity.service';
import { FeedbackService } from '@core/services/feedback.service';
import { HttpErrorHandler } from '@core/services/http-error-handler.service';
import { HttpInterceptor } from '@core/services/http-interceptor';
import { JobService } from '@core/services/job.service';
import { LocalAuthorityService } from '@core/services/localAuthority.service';
import { LocationService } from '@core/services/location.service';
import { MessageService } from '@core/services/message.service';
import { NationalityService } from '@core/services/nationality.service';
import { QualificationService } from '@core/services/qualification.service';
import { RecruitmentService } from '@core/services/recruitment.service';
import { RegistrationService } from '@core/services/registration.service';
import { TrainingService } from '@core/services/training.service';
import { windowProvider, WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { ForgotYourPasswordConfirmationComponent } from '@features/forgot-your-password/confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from '@features/forgot-your-password/edit/edit.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { ResetPasswordConfirmationComponent } from '@features/reset-password/confirmation/confirmation.component';
import { ResetPasswordEditComponent } from '@features/reset-password/edit/edit.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { SharedModule } from '@shared/shared.module';
import { Angulartics2Module } from 'angulartics2';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MigratedUserTermsConditionsComponent } from './features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
import { SentryErrorHandler } from './SentryErrorHandler.component';
import { SatisfactionSurveyComponent } from './features/satisfaction-survey/satisfaction-survey.component';
import { StaffMismatchBannerComponent } from './features/dashboard/home-tab/staff-mismatch-banner/staff-mismatch-banner.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FooterComponent,
    ForgotYourPasswordComponent,
    ForgotYourPasswordConfirmationComponent,
    ForgotYourPasswordEditComponent,
    HeaderComponent,
    HomeTabComponent,
    LoginComponent,
    LogoutComponent,
    MigratedUserTermsConditionsComponent,
    PageNotFoundComponent,
    ProblemWithTheServiceComponent,
    ResetPasswordComponent,
    ResetPasswordConfirmationComponent,
    ResetPasswordEditComponent,
    ServiceUnavailableComponent,
    SatisfactionSurveyComponent,
    StaffMismatchBannerComponent,
  ],
  imports: [
    Angulartics2Module.forRoot({
      pageTracking: {
        clearIds: true,
      },
    }),
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    HttpClientModule,
    HighchartsChartModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    BenchmarksModule,
  ],
  providers: [
    AuthGuard,
    BackService,
    CountryService,
    EstablishmentService,
    EthnicityService,
    FeedbackService,
    HttpErrorHandler,
    JobService,
    LocalAuthorityService,
    LocationService,
    MessageService,
    NationalityService,
    QualificationService,
    RecruitmentService,
    RegistrationService,
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    TrainingService,
    WindowRef,
    WorkerService,
    { provide: WindowToken, useFactory: windowProvider },
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
    LoggedInUserResolver,
    PrimaryWorkplaceResolver,
    NotificationsListResolver,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
