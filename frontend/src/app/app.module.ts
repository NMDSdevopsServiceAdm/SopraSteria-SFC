import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ProblemWithTheServiceComponent } from '@core/components/error/problem-with-the-service/problem-with-the-service.component';
import { ServiceUnavailableComponent } from '@core/components/error/service-unavailable/service-unavailable.component';
import { FooterComponent } from '@core/components/footer/footer.component';
import { HeaderComponent } from '@core/components/header/header.component';
import { StandAloneAccountComponent } from '@core/components/standAloneAccount/standAloneAccount.component';
import { SubsidiaryAccountComponent } from '@core/components/subsidiaryAccount/subsidiaryAccount.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from '@core/resolvers/careWorkforcePathway/no-of-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { CqcStatusCheckResolver } from '@core/resolvers/cqcStatusCheck/cqcStatusCheck.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { FeatureFlagsResolver } from '@core/resolvers/feature-flags.resolver';
import { FundingReportResolver } from '@core/resolvers/funding-report.resolver';
import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { HelpPageResolver } from '@core/resolvers/help-pages.resolver';
import { GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver } from '@core/resolvers/international-recruitment/no-of-workers-who-require-international-recruitment-answers.resolver';
import { LoggedInUserResolver } from '@core/resolvers/logged-in-user.resolver';
import { NotificationsListResolver } from '@core/resolvers/notifications-list.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { PrimaryWorkplaceResolver } from '@core/resolvers/primary-workplace.resolver';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { UsefulLinkPayResolver } from '@core/resolvers/useful-link-pay.resolver';
import { UsefulLinkRecruitmentResolver } from '@core/resolvers/useful-link-recruitment.resolver';
import { WizardResolver } from '@core/resolvers/wizard/wizard.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { AuthInterceptor } from '@core/services/auth-interceptor';
import { BackService } from '@core/services/back.service';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { CountryService } from '@core/services/country.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { EthnicityService } from '@core/services/ethnicity.service';
import { FeedbackService } from '@core/services/feedback.service';
import { HttpErrorHandler } from '@core/services/http-error-handler.service';
import { HttpInterceptor } from '@core/services/http-interceptor';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { JobService } from '@core/services/job.service';
import { LocationService } from '@core/services/location.service';
import { MessageService } from '@core/services/message.service';
import { NationalityService } from '@core/services/nationality.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { QualificationService } from '@core/services/qualification.service';
import { RecruitmentService } from '@core/services/recruitment.service';
import { RegistrationService } from '@core/services/registration.service';
import { MandatoryTrainingService, TrainingService } from '@core/services/training.service';
import { windowProvider, WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { AdminSkipService } from '@features/bulk-upload/admin-skip.service';
import { ParentWorkplaceAccounts } from '@features/create-account/workplace/parent-workplace-accounts/parent-workplace-accounts.component';
import { SelectMainServiceComponent } from '@features/create-account/workplace/select-main-service/select-main-service.component';
import { AscWdsCertificateComponent } from '@features/dashboard/asc-wds-certificate/asc-wds-certificate.component';
import { ForgotYourPasswordConfirmationComponent } from '@features/forgot-your-username-or-password/forgot-your-password/confirmation/confirmation.component';
import { ForgotYourPasswordEditComponent } from '@features/forgot-your-username-or-password/forgot-your-password/edit/edit.component';
import { ForgotYourPasswordComponent } from '@features/forgot-your-username-or-password/forgot-your-password/forgot-your-password.component';
import { ForgotYourUsernameOrPasswordComponent } from '@features/forgot-your-username-or-password/forgot-your-username-or-password.component';
import { FindAccountComponent } from '@features/forgot-your-username-or-password/forgot-your-username/find-account/find-account.component';
import { FindUsernameComponent } from '@features/forgot-your-username-or-password/forgot-your-username/find-username/find-username.component';
import { ForgotYourUsernameComponent } from '@features/forgot-your-username-or-password/forgot-your-username/forgot-your-username.component';
import { SecurityQuestionAnswerNotMatchComponent } from '@features/forgot-your-username-or-password/forgot-your-username/security-question-answer-not-match/security-question-answer-not-match.component';
import { UserAccountNotFoundComponent } from '@features/forgot-your-username-or-password/forgot-your-username/user-account-not-found/user-account-not-found.component';
import { UsernameFoundComponent } from '@features/forgot-your-username-or-password/username-found/username-found.component';
import { LoginComponent } from '@features/login/login.component';
import { VacanciesAndTurnoverLoginMessage } from '@features/login/vacancies-and-turnover-login-message/vacancies-and-turnover-login-message.component';
import { LogoutComponent } from '@features/logout/logout.component';
import { BecomeAParentComponent } from '@features/new-dashboard/become-a-parent/become-a-parent.component';
import { NewDashboardComponent } from '@features/new-dashboard/dashboard/dashboard.component';
import { DeleteWorkplaceComponent } from '@features/new-dashboard/delete-workplace/delete-workplace.component';
import { NewHomeTabComponent } from '@features/new-dashboard/home-tab/home-tab.component';
import { LinkToParentComponent } from '@features/new-dashboard/link-to-parent/link-to-parent.component';
import { ParentHomeTabComponent } from '@features/new-dashboard/parent-home-tab/parent-home-tab.component';
import { RemoveLinkToParentComponent } from '@features/new-dashboard/remove-link-to-parent/remove-link-to-parent.component';
import { StaffBasicRecord } from '@features/new-dashboard/staff-tab/staff-basic-record/staff-basic-record.component';
import { NewStaffTabComponent } from '@features/new-dashboard/staff-tab/staff-tab.component';
import { NewTrainingTabComponent } from '@features/new-dashboard/training-tab/training-tab.component';
import { NewWorkplaceTabComponent } from '@features/new-dashboard/workplace-tab/workplace-tab.component';
import { ResetPasswordConfirmationComponent } from '@features/reset-password/confirmation/confirmation.component';
import { ResetPasswordEditComponent } from '@features/reset-password/edit/edit.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';
import { SelectStarterJobRolesComponent } from '@features/workplace/select-starter-job-roles/select-starter-job-roles.component';
import { BenchmarksModule } from '@shared/components/benchmarks-tab/benchmarks.module';
import { DataAreaTabModule } from '@shared/components/data-area-tab/data-area-tab.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpAndTipsButtonComponent } from './features/help-and-tips-button/help-and-tips-button.component';
import { MigratedUserTermsConditionsComponent } from './features/migrated-user-terms-conditions/migrated-user-terms-conditions.component';
import { SatisfactionSurveyComponent } from './features/satisfaction-survey/satisfaction-survey.component';
import { SentryErrorHandler } from './SentryErrorHandler.component';
import { GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver } from '@core/resolvers/delegated-healthcare-activities/no-of-workers-with-delegated-healthcare-activities-unanswered.resolver';
import { SortByService } from '@core/services/sort-by.service';
import { TrainingCoursesLoginMessage } from '@features/login/training-courses-login-message/training-courses-login-message.component';

@NgModule({
  declarations: [
    AppComponent,
    AscWdsCertificateComponent,
    FooterComponent,
    ForgotYourPasswordComponent,
    ForgotYourPasswordConfirmationComponent,
    ForgotYourPasswordEditComponent,
    HeaderComponent,
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
    SelectMainServiceComponent,
    StandAloneAccountComponent,
    SubsidiaryAccountComponent,
    NewDashboardComponent,
    NewHomeTabComponent,
    NewWorkplaceTabComponent,
    NewStaffTabComponent,
    NewTrainingTabComponent,
    StaffBasicRecord,
    BecomeAParentComponent,
    RemoveLinkToParentComponent,
    LinkToParentComponent,
    ParentWorkplaceAccounts,
    DeleteWorkplaceComponent,
    ForgotYourUsernameOrPasswordComponent,
    UsernameFoundComponent,
    ForgotYourUsernameComponent,
    FindAccountComponent,
    FindUsernameComponent,
    SelectStarterJobRolesComponent,
    SecurityQuestionAnswerNotMatchComponent,
    UserAccountNotFoundComponent,
    VacanciesAndTurnoverLoginMessage,
    HelpAndTipsButtonComponent,
    TrainingCoursesLoginMessage,
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CommonModule,
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
    BenchmarksV2Service,
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
    MandatoryTrainingService,
    WindowRef,
    WorkerService,
    InternationalRecruitmentService,
    PreviousRouteService,
    SortByService,
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
    WorkplaceResolver,
    GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver,
    FundingReportResolver,
    HelpPageResolver,
    GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver,
    GetNoOfWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver,
    FeatureFlagsResolver,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
