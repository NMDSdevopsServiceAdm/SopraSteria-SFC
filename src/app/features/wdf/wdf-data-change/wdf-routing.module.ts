import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { AdultSocialCareStartedComponent } from '@features/workers/adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from '@features/workers/apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from '@features/workers/average-weekly-hours/average-weekly-hours.component';
import { BritishCitizenshipComponent } from '@features/workers/british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from '@features/workers/care-certificate/care-certificate.component';
import { ContractWithZeroHoursComponent } from '@features/workers/contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from '@features/workers/country-of-birth/country-of-birth.component';
import { DateOfBirthComponent } from '@features/workers/date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from '@features/workers/days-of-sickness/days-of-sickness.component';
import { DisabilityComponent } from '@features/workers/disability/disability.component';
import { EthnicityComponent } from '@features/workers/ethnicity/ethnicity.component';
import { GenderComponent } from '@features/workers/gender/gender.component';
import { HomePostcodeComponent } from '@features/workers/home-postcode/home-postcode.component';
import { MainJobStartDateComponent } from '@features/workers/main-job-start-date/main-job-start-date.component';
import { MentalHealthProfessionalComponent } from '@features/workers/mental-health-professional/mental-health-professional.component';
import { NationalInsuranceNumberComponent } from '@features/workers/national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from '@features/workers/nationality/nationality.component';
import { NursingCategoryComponent } from '@features/workers/nursing-category/nursing-category.component';
import { NursingSpecialismComponent } from '@features/workers/nursing-specialism/nursing-specialism.component';
import { OtherQualificationsLevelComponent } from '@features/workers/other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from '@features/workers/other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from '@features/workers/recruited-from/recruited-from.component';
import { SalaryComponent } from '@features/workers/salary/salary.component';
import { SelectRecordTypeComponent } from '@features/workers/select-record-type/select-record-type.component';
import { SocialCareQualificationLevelComponent } from '@features/workers/social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from '@features/workers/social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from '@features/workers/staff-details/staff-details.component';
import { WeeklyContractedHoursComponent } from '@features/workers/weekly-contracted-hours/weekly-contracted-hours.component';
import { YearArrivedUkComponent } from '@features/workers/year-arrived-uk/year-arrived-uk.component';

import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { WdfWorkplacesSummaryComponent } from './wdf-workplaces-summary/wdf-workplaces-summary.component';

const routes: Routes = [
  {
    path: '',
    // remove following 2 lines when wdf new design feature is live
    component: WdfOverviewComponent,
    data: { title: 'Workforce Development Fund' },
    // uncomment following 2 lines when wdf new design feature is live
    // redirectTo: 'data',
    // pathMatch: 'full',
  },
  {
    path: 'data',
    component: WdfDataComponent,
    canActivate: [HasPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
  },
  {
    path: 'staff-record/:id',
    resolve: { worker: WorkerResolver, establishment: WorkplaceResolver },
    children: [
      {
        path: '',
        component: WdfStaffRecordComponent,
        data: { title: 'WDF Staff Record' },
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
        path: 'select-record-type',
        canActivate: [CheckPermissionsGuard],
        component: SelectRecordTypeComponent,
        data: {
          permissions: ['canAddWorker'],
          title: 'Select Record Type',
        },
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
    ],
  },
  {
    path: 'workplaces',
    children: [
      {
        path: '',
        component: WdfWorkplacesSummaryComponent,
        data: { title: 'WDF Workplaces' },
      },
      {
        path: ':establishmentuid',
        children: [
          {
            path: '',
            component: WdfDataComponent,
            canActivate: [HasPermissionsGuard],
            data: { permissions: ['canViewWdfReport'], title: 'WDF data' },
          },
          {
            path: 'staff-record/:id',
            component: WdfStaffRecordComponent,
            data: { title: 'WDF Staff Record' },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfRoutingModule {}
