import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { FundingReportResolver } from '@core/resolvers/funding-report.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
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
import { EmployedFromOutsideUkComponent } from '@features/workers/employed-from-outside-uk/employed-from-outside-uk.component';
import { EthnicityComponent } from '@features/workers/ethnicity/ethnicity.component';
import { GenderComponent } from '@features/workers/gender/gender.component';
import { HealthAndCareVisaComponent } from '@features/workers/health-and-care-visa/health-and-care-visa.component';
import { HomePostcodeComponent } from '@features/workers/home-postcode/home-postcode.component';
import { Level2AdultSocialCareCertificateComponent } from '@features/workers/level-2-adult-social-care-certificate/level-2-adult-social-care-certificate.component';
import { MainJobRoleComponent } from '@features/workers/main-job-role/main-job-role.component';
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

import { FundingRequirementsComponent } from './funding-requirements/funding-requirements.component';
import { LearnMoreAboutFundingComponent } from './learn-more-about-funding/learn-more-about-funding.component';
import { WdfDataComponent } from './wdf-data/wdf-data.component';
import { WdfOverviewComponent } from './wdf-overview/wdf-overview.component';
import { WdfStaffRecordComponent } from './wdf-staff-record/wdf-staff-record.component';
import { CareWorkforcePathwayRoleComponent } from '@features/workers/care-workforce-pathway/care-workforce-pathway.component';
import { FeatureFlagsResolver } from '@core/resolvers/feature-flags.resolver';

const routes: Routes = [
  {
    path: '',
    component: WdfOverviewComponent,
    resolve: {
      report: FundingReportResolver,
    },
  },
  {
    path: 'data',
    component: WdfDataComponent,
    canActivate: [HasPermissionsGuard],
    data: { permissions: ['canViewWdfReport'], title: 'Funding data', withFunding: true },
    resolve: {
      workers: WorkersResolver,
      workplace: WorkplaceResolver,
      report: FundingReportResolver,
    },
  },
  {
    path: 'workplaces',
    children: [
      {
        path: ':establishmentuid',
        children: [
          {
            path: '',
            component: WdfDataComponent,
            canActivate: [HasPermissionsGuard],
            data: { permissions: ['canViewWdfReport'], title: 'Workplace funding data', withFunding: true },
            resolve: { workplace: WorkplaceResolver, report: FundingReportResolver },
          },
          {
            path: 'staff-record/:id',
            resolve: { worker: WorkerResolver, establishment: WorkplaceResolver },
            canActivate: [HasPermissionsGuard],
            data: {
              permissions: ['canViewWdfReport'],
              title: 'Staff Record Summary',
            },
            children: [
              {
                path: '',
                component: WdfStaffRecordComponent,
                data: { title: 'Funding Staff Record' },
                resolve: { report: FundingReportResolver, featureFlags: FeatureFlagsResolver },
              },
              {
                path: 'staff-details',
                component: StaffDetailsComponent,
                data: { title: 'Staff Details' },
              },
              {
                path: 'main-job-role',
                component: MainJobRoleComponent,
                data: { title: 'Main Job Role' },
                resolve: { jobs: JobsResolver },
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
                path: 'health-and-care-visa',
                component: HealthAndCareVisaComponent,
                data: { title: 'Health and Care Visa' },
              },
              {
                path: 'inside-or-outside-of-uk',
                component: EmployedFromOutsideUkComponent,
                data: { title: 'Inside or Outside UK' },
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
                path: 'level-2-care-certificate',
                component: Level2AdultSocialCareCertificateComponent,
                data: { title: 'Level 2 Adult Social Care Certificate' },
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
                path: 'care-workforce-pathway',
                component: CareWorkforcePathwayRoleComponent,
                data: { title: 'Care Workforce Pathway' },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'learn-more',
    component: LearnMoreAboutFundingComponent,
    data: { title: 'Learn More' },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: 'funding-requirements',
    component: FundingRequirementsComponent,
    data: { title: 'Funding Requirements' },
    resolve: {
      pages: PageResolver,
      report: FundingReportResolver,
    },
  },
  {
    path: 'staff-record/:id',
    resolve: { worker: WorkerResolver, establishment: WorkplaceResolver },
    children: [
      {
        path: '',
        component: WdfStaffRecordComponent,
        data: { title: 'Funding Staff Record' },
        resolve: { report: FundingReportResolver, featureFlags: FeatureFlagsResolver },
      },
      {
        path: 'staff-details',
        component: StaffDetailsComponent,
        data: { title: 'Staff Details' },
      },
      {
        path: 'main-job-role',
        component: MainJobRoleComponent,
        data: { title: 'Main Job Role' },
        resolve: { jobs: JobsResolver },
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
        path: 'health-and-care-visa',
        component: HealthAndCareVisaComponent,
        data: { title: 'Health and Care Visa' },
      },
      {
        path: 'inside-or-outside-of-uk',
        component: EmployedFromOutsideUkComponent,
        data: { title: 'Inside or Outside UK' },
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
        path: 'level-2-care-certificate',
        component: Level2AdultSocialCareCertificateComponent,
        data: { title: 'Level 2 Adult Social Care Certificate' },
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
        path: 'care-workforce-pathway',
        component: CareWorkforcePathwayRoleComponent,
        data: { title: 'Care Workforce Pathway' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FundingRoutingModule {}
