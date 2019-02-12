import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterGuard } from './core/guards/register/register.guard';
import { AuthGuard } from './core/services/auth-guard.service';
import { WorkerGuard } from './core/services/worker-guard.service';
import { ConfirmAccountDetailsComponent } from './features/confirm-account-details/confirm-account-details.component';
import { ConfirmLeaversComponent } from './features/confirm-leavers/confirm-leavers.component';
import { ConfirmStartersComponent } from './features/confirm-starters/confirm-starters.component';
import { ConfirmVacanciesComponent } from './features/confirm-vacancies/confirm-vacancies.component';
import { ConfirmWorkplaceDetailsComponent } from './features/confirm-workplace-details/confirm-workplace-details.component';
import { ContactUsComponent } from './features/contactUs/contactUs.component';
import { ContinueCreatingAccountComponent } from './features/continue-creating-account/continue-creating-account.component';
import { CqcRegisteredQuestionComponent } from './features/cqc-registered-question/cqc-registered-question.component';
import { CreateUsernameComponent } from './features/create-username/create-username.component';
import { EnterWorkplaceAddressComponent } from './features/enter-workplace-address/enter-workplace-address.component';
import { FeedbackComponent } from './features/feedback/feedback.component';
import { HomepageComponent } from './features/homepage/homepage.component';
import { LeaversComponent } from './features/leavers/leavers.component';
import { LoginComponent } from './features/login/login.component';
import { RegistrationCompleteComponent } from './features/registration-complete/registration-complete.component';
import { SecurityQuestionComponent } from './features/security-question/security-question.component';
import { SelectMainServiceComponent } from './features/select-main-service/select-main-service.component';
import { SelectOtherServicesComponent } from './features/select-other-services/select-other-services.component';
import { SelectWorkplaceAddressComponent } from './features/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from './features/select-workplace/select-workplace.component';
import { ServicesCapacityComponent } from './features/services-capacity/services-capacity.component';
import { ShareLocalAuthorityComponent } from './features/shareLocalAuthorities/shareLocalAuthority.component';
import { ShareOptionsComponent } from './features/shareOptions/shareOptions.component';
import { StaffComponent } from './features/staff/staff.component';
import { StartersComponent } from './features/starters/starters.component';
import { TypeOfEmployerComponent } from './features/type-of-employer/type-of-employer.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';
import { VacanciesComponent } from './features/vacancies/vacancies.component';
import { AdultSocialCareStartedComponent } from './features/workers/adult-social-care-started/adult-social-care-started.component';
import { AverageWeeklyHoursComponent } from './features/workers/average-weekly-hours/average-weekly-hours.component';
import { BritishCitizenshipComponent } from './features/workers/british-citizenship/british-citizenship.component';
import { ContractWithZeroHoursComponent } from './features/workers/contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './features/workers/country-of-birth/country-of-birth.component';
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
import { OtherQualificationsComponent } from './features/workers/other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './features/workers/recruited-from/recruited-from.component';
import { YearArrivedUkComponent } from './features/workers/year-arrived-uk/year-arrived-uk.component';
import { TermsConditionsComponent } from './shared/terms-conditions/terms-conditions.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
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
    path: 'welcome',
    component: HomepageComponent,
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
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
    path: 'staff',
    component: StaffComponent,
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
    path: 'worker',
    component: EditWorkerComponent,
    canActivateChild: [AuthGuard, WorkerGuard],
    children: [
      {
        path: 'edit-staff-record',
        component: CreateStaffRecordComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'mental-health',
        component: MentalHealthComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'main-job-start-date',
        component: MainJobStartDateComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'other-job-roles',
        component: OtherJobRolesComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'national-insurance-number',
        component: NationalInsuranceNumberComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'date-of-birth',
        component: DateOfBirthComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'home-postcode',
        component: HomePostcodeComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'gender',
        component: GenderComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'disability',
        component: DisabilityComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'ethnicity',
        component: EthnicityComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'nationality',
        component: NationalityComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'british-citizenship',
        component: BritishCitizenshipComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'country-of-birth',
        component: CountryOfBirthComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'year-arrived-uk',
        component: YearArrivedUkComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'recruited-from',
        component: RecruitedFromComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'adult-social-care-started',
        component: AdultSocialCareStartedComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'days-of-sickness',
        component: DaysOfSicknessComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'contract-with-zero-hours',
        component: ContractWithZeroHoursComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'average-weekly-hours',
        component: AverageWeeklyHoursComponent,
        canLoad: [AuthGuard],
      },
      {
        path: 'other-qualifications',
        component: OtherQualificationsComponent,
        canLoad: [AuthGuard],
      },
    ],
  },
  {
    path: 'worker/create-staff-record',
    component: CreateStaffRecordComponent,
    canLoad: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/welcome',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
