import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdultSocialCareStartedComponent } from './adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from './apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from './average-weekly-hours/average-weekly-hours.component';
import { BritishCitizenshipComponent } from './british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from './care-certificate/care-certificate.component';
import { ContractWithZeroHoursComponent } from './contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './country-of-birth/country-of-birth.component';
import { CreateStaffRecordStartScreenComponent } from './create-staff-record-start-screen/create-staff-record-start-screen.component';
import { CreateStaffRecordComponent } from './create-staff-record/create-staff-record.component';
import { DateOfBirthComponent } from './date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './days-of-sickness/days-of-sickness.component';
import { DisabilityComponent } from './disability/disability.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EthnicityComponent } from './ethnicity/ethnicity.component';
import { GenderComponent } from './gender/gender.component';
import { HomePostcodeComponent } from './home-postcode/home-postcode.component';
import { MainJobStartDateComponent } from './main-job-start-date/main-job-start-date.component';
import { MentalHealthComponent } from './mental-health/mental-health.component';
import { NationalInsuranceNumberComponent } from './national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './nationality/nationality.component';
import { OtherJobRolesComponent } from './other-job-roles/other-job-roles.component';
import { OtherQualificationsLevelComponent } from './other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './recruited-from/recruited-from.component';
import { SalaryComponent } from './salary/salary.component';
import { SocialCareQualificationLevelComponent } from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { WorkerSaveSuccessComponent } from './worker-save-success/worker-save-success.component';
import { WorkerSummaryComponent } from './worker-summary/worker-summary.component';
import { WorkerResolver } from './worker.resolver';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';

const routes: Routes = [
  {
    path: 'start-screen',
    component: CreateStaffRecordStartScreenComponent,
  },
  {
    path: 'create-staff-record',
    component: CreateStaffRecordComponent,
  },
  {
    path: 'save-success',
    component: WorkerSaveSuccessComponent,
  },
  {
    path: ':id',
    component: EditWorkerComponent,
    // canActivateChild: [WorkerGuard],
    resolve: { worker: WorkerResolver },
    children: [
      {
        path: 'edit-staff-record',
        component: CreateStaffRecordComponent,
      },
      {
        path: 'mental-health',
        component: MentalHealthComponent,
      },
      {
        path: 'main-job-start-date',
        component: MainJobStartDateComponent,
      },
      {
        path: 'other-job-roles',
        component: OtherJobRolesComponent,
      },
      {
        path: 'national-insurance-number',
        component: NationalInsuranceNumberComponent,
      },
      {
        path: 'date-of-birth',
        component: DateOfBirthComponent,
      },
      {
        path: 'home-postcode',
        component: HomePostcodeComponent,
      },
      {
        path: 'gender',
        component: GenderComponent,
      },
      {
        path: 'disability',
        component: DisabilityComponent,
      },
      {
        path: 'ethnicity',
        component: EthnicityComponent,
      },
      {
        path: 'nationality',
        component: NationalityComponent,
      },
      {
        path: 'british-citizenship',
        component: BritishCitizenshipComponent,
      },
      {
        path: 'country-of-birth',
        component: CountryOfBirthComponent,
      },
      {
        path: 'year-arrived-uk',
        component: YearArrivedUkComponent,
      },
      {
        path: 'recruited-from',
        component: RecruitedFromComponent,
      },
      {
        path: 'adult-social-care-started',
        component: AdultSocialCareStartedComponent,
      },
      {
        path: 'days-of-sickness',
        component: DaysOfSicknessComponent,
      },
      {
        path: 'contract-with-zero-hours',
        component: ContractWithZeroHoursComponent,
      },
      {
        path: 'average-weekly-hours',
        component: AverageWeeklyHoursComponent,
      },
      {
        path: 'weekly-contracted-hours',
        component: WeeklyContractedHoursComponent,
      },
      {
        path: 'salary',
        component: SalaryComponent,
      },
      {
        path: 'care-certificate',
        component: CareCertificateComponent,
      },
      {
        path: 'apprenticeship-training',
        component: ApprenticeshipTrainingComponent,
      },
      {
        path: 'social-care-qualification',
        component: SocialCareQualificationComponent,
      },
      {
        path: 'social-care-qualification-level',
        component: SocialCareQualificationLevelComponent,
      },
      {
        path: 'other-qualifications',
        component: OtherQualificationsComponent,
      },
      {
        path: 'other-qualifications-level',
        component: OtherQualificationsLevelComponent,
      },
      {
        path: 'summary',
        component: WorkerSummaryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkersRoutingModule {}
