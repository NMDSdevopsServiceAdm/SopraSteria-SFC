import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ProblemWithTheServiceComponent } from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ServiceUnavailableComponent } from '@core/components/error/service-unavailable/service-unavailable.component';
import { FooterComponent } from '@core/components/footer/footer.component';
import { HeaderComponent } from '@core/components/header/header.component';
import { StandAloneAccountComponent } from '@core/components/standAloneAccount/standAloneAccount.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { CqcStatusCheckResolver } from '@core/resolvers/cqcStatusCheck/cqcStatusCheck.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { AuthInterceptor } from '@core/services/auth-interceptor';
import { BackService } from '@core/services/back.service';
import { CountryService } from '@core/services/country.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { EthnicityService } from '@core/services/ethnicity.service';
import { FeedbackService } from '@core/services/feedback.service';
import { HttpErrorHandler } from '@core/services/http-error-handler.service';
import { HttpInterceptor } from '@core/services/http-interceptor';
import { JobService } from '@core/services/job.service';
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
import { TailoredSeminarsComponent } from '@features/benefits-bundle/benefit-tailored-seminars/benefit-tailored-seminars.component';
import { BenefitsBundleComponent } from '@features/benefits-bundle/benefits-bundle.component';
import { BenefitsTrainingDiscountsComponent } from '@features/benefits-bundle/benefits-training-discounts/benefits-training-discounts.component';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { SelectMainServiceComponent } from '@features/create-account/workplace/select-main-service/select-main-service.component';
import { AscWdsCertificateComponent } from '@features/dashboard/asc-wds-certificate/asc-wds-certificate.component';
import { DashboardHeaderComponent } from '@features/dashboard/dashboard-header/dashboard-header.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { ParentHomeTabComponent } from '@features/new-dashboard/parent-home-tab/parent-home-tab.component';
import { FirstLoginPageComponent } from '@features/first-login-page/first-login-page.component';
import { FirstLoginWizardComponent } from '@features/first-login-wizard/first-login-wizard.component';
import { ForgotYourPasswordConfirmationComponent } from '@features/forgot-your-password/confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from '@features/forgot-your-password/edit/edit.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-password/forgot-your-password.component';
import { LoginComponent } from '@features/login/login.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { NewBenchmarksTabComponent } from '@features/new-dashboard/benchmarks-tab/benchmarks-tab.component';
import { NewComparisonGroupHeaderComponent } from '@features/new-dashboard/benchmarks-tab/comparison-group-header/comparison-group-header.component';
import { DashboardWrapperComponent } from '@features/new-dashboard/dashboard-wrapper.component';
import { NewDashboardComponent } from '@features/new-dashboard/dashboard/dashboard.component';
import { CardComponent } from '@features/new-dashboard/home-tab/card/card.component';
import { NewHomeTabComponent } from '@features/new-dashboard/home-tab/home-tab.component';
import { SummarySectionComponent } from '@features/new-dashboard/home-tab/summary-section/summary-section.component';
import { StaffBasicRecord } from '@features/new-dashboard/staff-tab/staff-basic-record/staff-basic-record.component';
import { NewStaffTabComponent } from '@features/new-dashboard/staff-tab/staff-tab.component';
import { NewTrainingLinkPanelComponent } from '@features/new-dashboard/training-tab/training-link-panel/training-link-panel.component';
import { NewTrainingTabComponent } from '@features/new-dashboard/training-tab/training-tab.component';
import { NewWorkplaceTabComponent } from '@features/new-dashboard/workplace-tab/workplace-tab.component';
import { ResetPasswordConfirmationComponent } from '@features/reset-password/confirmation/confirmation.component';
import { ResetPasswordEditComponent } from '@features/reset-password/edit/edit.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { DataAreaTabModule } from '@shared/components/data-area-tab/data-area-tab.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { Angulartics2Module } from 'angulartics2';
import { HighchartsChartModule } from 'highcharts-angular';
import { BecomeAParentComponent } from '@features/new-dashboard/become-a-parent/become-a-parent.component';
import { RemoveLinkToParentComponent } from '@features/new-dashboard/remove-link-to-parent/remove-link-to-parent.component';
import { LinkToParentComponent } from '@features/new-dashboard/link-to-parent/link-to-parent.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BenefitAccordionComponent } from './features/benefits-bundle/benefit-accordion/benefit-accordion.component';
import { BenefitsELearningComponent } from './features/benefits-bundle/benefits-elearning/benefits-elearning.component';
import { StaffMismatchBannerComponent } from './features/dashboard/home-tab/staff-mismatch-banner/staff-mismatch-banner.component';
import { MigratedUserTermsConditionsComponent } from './features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
import { SatisfactionSurveyComponent } from './features/satisfaction-survey/satisfaction-survey.component';
import { SentryErrorHandler } from './SentryErrorHandler.component';
import { BenchmarksServiceFactory } from '@core/factory/BenchmarksServiceFactory';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { UsefulLinkPayResolver } from '@core/resolvers/useful-link-pay.resolver';
import { UsefulLinkRecruitmentResolver } from '@core/resolvers/useful-link-recruitment.resolver';
import { ParentWorkplaceAccounts } from '@features/create-account/workplace/parent-workplace-accounts/parent-workplace-accounts.component';
import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { ViewSubsidiaryWorkplaceComponent } from '@features/subsidiary/workplace/view-subsidiary-workplace.component';

@NgModule({
  declarations: [
    AppComponent,
    AscWdsCertificateComponent,
    DashboardComponent,
    DashboardHeaderComponent,
    FirstLoginPageComponent,
    FirstLoginWizardComponent,
    FooterComponent,
    ForgotYourPasswordComponent,
    ForgotYourPasswordConfirmationComponent,
    ForgotYourPasswordEditComponent,
    HeaderComponent,
    HomeTabComponent,
    ParentHomeTabComponent,
    LoginComponent,
    LogoutComponent,
    MigratedUserTermsConditionsComponent,
    ProblemWithTheServiceComponent,
    ResetPasswordComponent,
    ResetPasswordConfirmationComponent,
    ResetPasswordEditComponent,
    ServiceUnavailableComponent,
    SatisfactionSurveyComponent,
    StaffMismatchBannerComponent,
    SelectMainServiceComponent,
    BenefitsBundleComponent,
    BenefitAccordionComponent,
    BenefitsTrainingDiscountsComponent,
    BenefitsELearningComponent,
    TailoredSeminarsComponent,
    StandAloneAccountComponent,
    DashboardWrapperComponent,
    NewDashboardComponent,
    NewHomeTabComponent,
    NewWorkplaceTabComponent,
    NewStaffTabComponent,
    NewTrainingTabComponent,
    NewBenchmarksTabComponent,
    NewTrainingLinkPanelComponent,
    NewComparisonGroupHeaderComponent,
    CardComponent,
    SummarySectionComponent,
    StaffBasicRecord,
    BecomeAParentComponent,
    RemoveLinkToParentComponent,
    LinkToParentComponent,
    ParentWorkplaceAccounts,
    ViewSubsidiaryWorkplaceComponent,
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
    DataAreaTabModule,
  ],
  providers: [
    AuthGuard,
    AdminSkipService,
    {
      provide: BenchmarksServiceBase,
      useFactory: BenchmarksServiceFactory,
      deps: [FeatureFlagsService, HttpClient],
    },
    BackService,
    CountryService,
    EstablishmentService,
    EthnicityService,
    FeedbackService,
    HttpErrorHandler,
    JobService,
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
    FeatureFlagsService,
    WizardResolver,
    PageResolver,
    AllUsersForEstablishmentResolver,
    WorkersResolver,
    TotalStaffRecordsResolver,
    CqcStatusCheckResolver,
    BenchmarksResolver,
    RankingsResolver,
    UsefulLinkPayResolver,
    UsefulLinkRecruitmentResolver,
    GetMissingCqcLocationsResolver,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
