import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WdfStaffSummaryComponent } from '@features/workers/wdf-staff-summary/wdf-staff-summary.component';

import { AddEditQualificationComponent } from './add-edit-qualification/add-edit-qualification.component';
import { AddEditTrainingComponent } from './add-edit-training/add-edit-training.component';
import { AdultSocialCareStartedComponent } from './adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from './apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from './average-weekly-hours/average-weekly-hours.component';
import { BasicRecordsSaveSuccessComponent } from './basic-records-save-success/basic-records-save-success.component';
import { BritishCitizenshipComponent } from './british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from './care-certificate/care-certificate.component';
import { CheckStaffRecordComponent } from './check-staff-record/check-staff-record.component';
import { ContractWithZeroHoursComponent } from './contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './country-of-birth/country-of-birth.component';
import {
  CreateBasicRecordsStartScreenComponent,
} from './create-basic-records-start-screen/create-basic-records-start-screen.component';
import { CreateBasicRecordsComponent } from './create-basic-records/create-basic-records.component';
import {
  CreateStaffRecordStartScreenComponent,
} from './create-staff-record-start-screen/create-staff-record-start-screen.component';
import { DateOfBirthComponent } from './date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './days-of-sickness/days-of-sickness.component';
import { DisabilityComponent } from './disability/disability.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EthnicityComponent } from './ethnicity/ethnicity.component';
import { GenderComponent } from './gender/gender.component';
import { HomePostcodeComponent } from './home-postcode/home-postcode.component';
import { MainJobStartDateComponent } from './main-job-start-date/main-job-start-date.component';
import { MentalHealthProfessionalComponent } from './mental-health-professional/mental-health-professional.component';
import { NationalInsuranceNumberComponent } from './national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './nationality/nationality.component';
import { NursingCategoryComponent } from './nursing-category/nursing-category.component';
import { NursingSpecialismComponent } from './nursing-specialism/nursing-specialism.component';
import { OtherJobRolesComponent } from './other-job-roles/other-job-roles.component';
import { OtherQualificationsLevelComponent } from './other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './recruited-from/recruited-from.component';
import { SalaryComponent } from './salary/salary.component';
import {
  SocialCareQualificationLevelComponent,
} from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { StaffRecordComponent } from './staff-record/staff-record.component';
import { TotalStaffComponent } from './total-staff/total-staff.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { WorkerSaveSuccessComponent } from './worker-save-success/worker-save-success.component';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';

const routes: Routes = [
  {
    path: 'start-screen',
    canActivate: [CheckPermissionsGuard],
    component: CreateStaffRecordStartScreenComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Create Staff Record Start'
    },
  },
  {
    path: 'total-staff',
    canActivate: [CheckPermissionsGuard],
    component: TotalStaffComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Total Staff'
    },
  },
  {
    path: 'basic-records-start-screen',
    canActivate: [CheckPermissionsGuard],
    component: CreateBasicRecordsStartScreenComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Create Basic Records Start'
    },
  },
  {
    path: 'create-basic-records',
    canActivate: [CheckPermissionsGuard],
    component: CreateBasicRecordsComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Create Basic Records'
    },
  },
  {
    path: 'basic-records-save-success',
    canActivate: [CheckPermissionsGuard],
    component: BasicRecordsSaveSuccessComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Basic Records Save Success'
    },
  },
  {
    path: 'create-staff-record',
    canActivate: [CheckPermissionsGuard],
    component: StaffDetailsComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Create Staff Records'
    },
  },
  {
    path: ':id',
    canActivate: [CheckPermissionsGuard],
    component: EditWorkerComponent,
    resolve: { worker: WorkerResolver },
    data: {
      permissions: ['canEditWorker'],
    },
    children: [
      {
        path: '',
        component: StaffRecordComponent,
        data: { title: 'Staff Record' },
      },
      {
        path: 'wdf-summary',
        component: WdfStaffSummaryComponent,
        data: { title: 'Staff Record' },
      },
      {
        path: 'staff-details',
        component: StaffDetailsComponent,
        data: { title: 'Staff Details' },
      },
      {
        path: 'main-job-start-date',
        component: MainJobStartDateComponent,
        data: { title: 'Main Job Role Start Date' },
      },
      {
        path: 'other-job-roles',
        component: OtherJobRolesComponent,
        data: { title: 'Other Job Roles' },
      },
      {
        path: 'nursing-category',
        component: NursingCategoryComponent,
        data: { title: 'Nursing Category' },
      },
      {
        path: 'nursing-specialism',
        component: NursingSpecialismComponent,
        data: { title: 'Nursing Specialism' },
      },
      {
        path: 'mental-health-professional',
        component: MentalHealthProfessionalComponent,
        data: { title: 'Mental Health Professional' },
      },
      {
        path: 'national-insurance-number',
        component: NationalInsuranceNumberComponent,
        data: { title: 'National Insurance Number' },
      },
      {
        path: 'date-of-birth',
        component: DateOfBirthComponent,
        data: { title: 'Date of Birth' },
      },
      {
        path: 'home-postcode',
        component: HomePostcodeComponent,
        data: { title: 'Home Postcode' },
      },
      {
        path: 'gender',
        component: GenderComponent,
        data: { title: 'Gender' },
      },
      {
        path: 'disability',
        component: DisabilityComponent,
        data: { title: 'Disability' },
      },
      {
        path: 'ethnicity',
        component: EthnicityComponent,
        data: { title: 'Ethnicity' },
      },
      {
        path: 'nationality',
        component: NationalityComponent,
        data: { title: 'Nationality' },
      },
      {
        path: 'british-citizenship',
        component: BritishCitizenshipComponent,
        data: { title: 'British Citizenship' },
      },
      {
        path: 'country-of-birth',
        component: CountryOfBirthComponent,
        data: { title: 'Country of Birth' },
      },
      {
        path: 'year-arrived-uk',
        component: YearArrivedUkComponent,
        data: { title: 'Year Arrived in the UK' },
      },
      {
        path: 'recruited-from',
        component: RecruitedFromComponent,
        data: { title: 'Recruited From' },
      },
      {
        path: 'adult-social-care-started',
        component: AdultSocialCareStartedComponent,
        data: { title: 'Adult Social Care Started' },
      },
      {
        path: 'days-of-sickness',
        component: DaysOfSicknessComponent,
        data: { title: 'Days of Sickness' },
      },
      {
        path: 'contract-with-zero-hours',
        component: ContractWithZeroHoursComponent,
        data: { title: 'Contract with Zero Hours' },
      },
      {
        path: 'average-weekly-hours',
        component: AverageWeeklyHoursComponent,
        data: { title: 'Average Weekly Hours' },
      },
      {
        path: 'weekly-contracted-hours',
        component: WeeklyContractedHoursComponent,
        data: { title: 'Weekly Contracted Hours' },
      },
      {
        path: 'salary',
        component: SalaryComponent,
        data: { title: 'Salary' },
      },
      {
        path: 'care-certificate',
        component: CareCertificateComponent,
        data: { title: 'Care Certificate' },
      },
      {
        path: 'apprenticeship-training',
        component: ApprenticeshipTrainingComponent,
        data: { title: 'Apprenticeship Training' },
      },
      {
        path: 'social-care-qualification',
        component: SocialCareQualificationComponent,
        data: { title: 'Social Care Qualification' },
      },
      {
        path: 'social-care-qualification-level',
        component: SocialCareQualificationLevelComponent,
        data: { title: 'Highest Social Care Qualification Level' },
      },
      {
        path: 'other-qualifications',
        component: OtherQualificationsComponent,
        data: { title: 'Other Qualifications' },
      },
      {
        path: 'other-qualifications-level',
        component: OtherQualificationsLevelComponent,
        data: { title: 'Highest Level of Other Qualifications' },
      },
      {
        path: 'check-answers',
        component: CheckStaffRecordComponent,
        data: { title: 'Check Answers' },
      },
      {
        path: 'save-success',
        component: WorkerSaveSuccessComponent,
        data: { title: 'Success' },
      },
      {
        path: 'add-qualification',
        component: AddEditQualificationComponent,
        data: { title: 'Add Qualification' },
      },
      {
        path: 'qualification/:qualificationId',
        component: AddEditQualificationComponent,
        data: { title: 'Qualification' },
      },
      {
        path: 'add-training',
        component: AddEditTrainingComponent,
        data: { title: 'Add Training' },
      },
      {
        path: 'training/:trainingRecordId',
        component: AddEditTrainingComponent,
        data: { title: 'Training' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkersRoutingModule {}
