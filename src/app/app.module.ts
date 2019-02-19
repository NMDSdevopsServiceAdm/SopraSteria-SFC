import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundPagesComponent } from './core/error/page-not-found-pages/page-not-found-pages.component';
import { ProblemWithTheServicePagesComponent } from './core/error/problem-with-the-service-pages/problem-with-the-service-pages.component';
import { ServiceUnavailablePagesComponent } from './core/error/service-unavailable-pages/service-unavailable-pages.component';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';
import { MessagesComponent } from './core/messages/messages.component';
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
import { CqcRegisteredQuestionEditComponent } from './features/cqc-registered-question/cqc-registered-question-edit/cqc-registered-question-edit.component';
import { CqcRegisteredQuestionComponent } from './features/cqc-registered-question/cqc-registered-question.component';
import { CreateUsernameComponent } from './features/create-username/create-username.component';
import { EnterWorkplaceAddressComponent } from './features/enter-workplace-address/enter-workplace-address.component';
import { FeedbackComponent } from './features/feedback/feedback.component';
import { HomepageComponent } from './features/homepage/homepage.component';
import { LeaversComponent } from './features/leavers/leavers.component';
import { LoginComponent } from './features/login/login.component';
import { LogoutComponent } from './features/logout/logout.component';
import { RegisterComponent } from './features/register/register.component';
import { RegistrationCompleteComponent } from './features/registration-complete/registration-complete.component';
import { SecurityQuestionComponent } from './features/security-question/security-question.component';
import { SelectMainServiceComponent } from './features/select-main-service/select-main-service.component';
import { SelectOtherServicesComponent } from './features/select-other-services/select-other-services.component';
import { SelectWorkplaceAddressComponent } from './features/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from './features/select-workplace/select-workplace.component';
import { ServicesCapacityComponent } from './features/services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from './features/shareLocalAuthorities/shareLocalAuthority.component';
import { ShareOptionsComponent } from './features/shareOptions/shareOptions.component';
import { SharingComponent } from './features/sharing/sharing.component';
import { StaffComponent } from './features/staff/staff.component';
import { StartersComponent } from './features/starters/starters.component';
import { TypeOfEmployerComponent } from './features/type-of-employer/type-of-employer.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';
import { VacanciesComponent } from './features/vacancies/vacancies.component';
import { AdultSocialCareStartedComponent } from './features/workers/adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from './features/workers/apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from './features/workers/average-weekly-hours/average-weekly-hours.component';
import { BlankCardComponent } from './features/workers/blank-card.component';
import { BritishCitizenshipComponent } from './features/workers/british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from './features/workers/care-certificate/care-certificate.component';
import { ContractWithZeroHoursComponent } from './features/workers/contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './features/workers/country-of-birth/country-of-birth.component';
import { CreateStaffRecordStartScreenComponent } from './features/workers/create-staff-record-start-screen/create-staff-record-start-screen.component';
import { CreateStaffRecordComponent } from './features/workers/create-staff-record/create-staff-record.component';
import { DateOfBirthComponent } from './features/workers/date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './features/workers/days-of-sickness/days-of-sickness.component';
import { DisabilityComponent } from './features/workers/disability/disability.component';
import { EditWorkerComponent } from './features/workers/edit-worker/edit-worker.component';
import { EthnicityComponent } from './features/workers/ethnicity/ethnicity.component';
import { GenderComponent } from './features/workers/gender/gender.component';
import { HomePostcodeComponent } from './features/workers/home-postcode/home-postcode.component';
import { MainJobStartDateComponent } from './features/workers/main-job-start-date/main-job-start-date.component';
import { MentalHealthComponent } from './features/workers/mental-health/mental-health.component';
import { NationalInsuranceNumberComponent } from './features/workers/national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './features/workers/nationality/nationality.component';
import { OtherJobRolesComponent } from './features/workers/other-job-roles/other-job-roles.component';
import { OtherQualificationsLevelComponent } from './features/workers/other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './features/workers/other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './features/workers/recruited-from/recruited-from.component';
import { SalaryComponent } from './features/workers/salary/salary.component';
import { SocialCareQualificationLevelComponent } from './features/workers/social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './features/workers/social-care-qualification/social-care-qualification.component';
import { WeeklyContractedHoursComponent } from './features/workers/weekly-contracted-hours/weekly-contracted-hours.component';
import { WorkerSummaryComponent } from './features/workers/worker-summary/worker-summary.component';
import { WorkersModule } from './features/workers/workers.module';
import { YearArrivedUkComponent } from './features/workers/year-arrived-uk/year-arrived-uk.component';
import { AutoSuggestComponent } from './shared/components/auto-suggest/auto-suggest.component';
import { DatePickerComponent } from './shared/components/date-picker/date-picker.component';
import { DetailsComponent } from './shared/components/details/details.component';
import { SubmitButtonComponent } from './shared/components/submit-button/submit-button.component';
import { TermsConditionsComponent } from './shared/components/terms-conditions/terms-conditions.component';
import { NumberDigitsMax } from './shared/number-digits-max.directive';
import { NumberIntOnly } from './shared/number-int-only.directive';
import { NumberMax } from './shared/number-max.directive';
import { NumberPositiveOnly } from './shared/number-positive-only.directive';
import { Number } from './shared/number.directive';
import { SharedModule } from './shared/shared.module';


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
    HomepageComponent,
    SelectOtherServicesComponent,
    TypeOfEmployerComponent,
    Number,
    NumberIntOnly,
    NumberMax,
    NumberPositiveOnly,
    NumberDigitsMax,
    VacanciesComponent,
    ConfirmVacanciesComponent,
    StartersComponent,
    MessagesComponent,
    ConfirmStartersComponent,
    LeaversComponent,
    ConfirmLeaversComponent,
    StaffComponent,
    ServicesCapacityComponent,
    SharingComponent,
    ShareLocalAuthorityComponent,
    ShareOptionsComponent,
    FeedbackComponent,
    ContactUsComponent,
    TermsConditionsComponent,
    LogoutComponent,
    CreateStaffRecordComponent,
    SubmitButtonComponent,
    MentalHealthComponent,
    MainJobStartDateComponent,
    NationalInsuranceNumberComponent,
    DatePickerComponent,
    OtherJobRolesComponent,
    DateOfBirthComponent,
    HomePostcodeComponent,
    GenderComponent,
    DisabilityComponent,
    EthnicityComponent,
    NationalityComponent,
    RecruitedFromComponent,
    AdultSocialCareStartedComponent,
    CountryOfBirthComponent,
    BritishCitizenshipComponent,
    AutoSuggestComponent,
    YearArrivedUkComponent,
    DaysOfSicknessComponent,
    ContractWithZeroHoursComponent,
    EditWorkerComponent,
    AverageWeeklyHoursComponent,
    WeeklyContractedHoursComponent,
    SalaryComponent,
    BlankCardComponent,
    CareCertificateComponent,
    ApprenticeshipTrainingComponent,
    SocialCareQualificationComponent,
    SocialCareQualificationLevelComponent,
    OtherQualificationsComponent,
    PageNotFoundPagesComponent,
    ProblemWithTheServicePagesComponent,
    ServiceUnavailablePagesComponent,
    OtherQualificationsLevelComponent,
    DetailsComponent,
    WorkerSummaryComponent,
    CreateStaffRecordStartScreenComponent,
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
    WorkersModule,
    SharedModule,
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
