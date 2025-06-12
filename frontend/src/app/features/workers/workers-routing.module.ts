import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { RequireCWPAnswerForSomeWorkersGuard } from '@core/guards/require-cwp-answer-for-some-workers/require-cwp-answer-for-some-workers.guard';
import { AvailableQualificationsResolver } from '@core/resolvers/available-qualification.resolver';
import { GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from '@core/resolvers/careWorkforcePathway/get-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { FeatureFlagsResolver } from '@core/resolvers/feature-flags.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { LongTermAbsenceResolver } from '@core/resolvers/long-term-absence.resolver';
import { MandatoryTrainingCategoriesResolver } from '@core/resolvers/mandatory-training-categories.resolver';
import { QualificationResolver } from '@core/resolvers/qualification.resolver';
import { TrainingAndQualificationRecordsResolver } from '@core/resolvers/training-and-qualification-records.resolver';
import { TrainingCategoriesResolver } from '@core/resolvers/training-categories.resolver';
import { TrainingRecordResolver } from '@core/resolvers/training-record.resolver';
import { TrainingRecordsForCategoryResolver } from '@core/resolvers/training-records-for-category.resolver';
import { WorkerReasonsForLeavingResolver } from '@core/resolvers/worker-reasons-for-leaving.resolver';
import { WorkerResolver } from '@core/resolvers/worker.resolver';
import { WorkplaceUpdateFlowType } from '@core/services/vacancies-and-turnover.service';
import { SelectQualificationTypeComponent } from '@features/training-and-qualifications/add-edit-qualification/select-qualification-type/select-qualification-type.component';
import { SelectTrainingCategoryComponent } from '@features/training-and-qualifications/add-edit-training/select-training-category/select-training-category.component';
import { ViewTrainingComponent } from '@shared/components/training-and-qualifications-categories/view-trainings/view-trainings.component';
import { UpdateLeaversComponent } from '@shared/components/update-starters-leavers-vacancies/update-leavers/update-leavers.component';
import { UpdateStartersComponent } from '@shared/components/update-starters-leavers-vacancies/update-starters/update-starters.component';
import { UpdateVacanciesComponent } from '@shared/components/update-starters-leavers-vacancies/update-vacancies/update-vacancies.component';

import {
  JobRoleType,
  SelectJobRolesToAddComponent,
} from '../../shared/components/update-starters-leavers-vacancies/select-job-roles-to-add/select-job-roles-to-add.component';
import { AddEditQualificationComponent } from '../training-and-qualifications/add-edit-qualification/add-edit-qualification.component';
import { AddEditTrainingComponent } from '../training-and-qualifications/add-edit-training/add-edit-training.component';
import { DeleteRecordComponent } from '../training-and-qualifications/new-training-qualifications-record/delete-record/delete-record.component';
import { NewTrainingAndQualificationsRecordComponent } from '../training-and-qualifications/new-training-qualifications-record/new-training-and-qualifications-record.component';
import { AddAnotherStaffRecordComponent } from './add-another-staff-record/add-another-staff-record.component';
import { AdultSocialCareStartedComponent } from './adult-social-care-started/adult-social-care-started.component';
import { ApprenticeshipTrainingComponent } from './apprenticeship-training/apprenticeship-training.component';
import { AverageWeeklyHoursComponent } from './average-weekly-hours/average-weekly-hours.component';
import { BasicRecordsSaveSuccessComponent } from './basic-records-save-success/basic-records-save-success.component';
import { BritishCitizenshipComponent } from './british-citizenship/british-citizenship.component';
import { CareCertificateComponent } from './care-certificate/care-certificate.component';
import { CareWorkforcePathwayWorkersSummaryComponent as CareWorkforcePathwayWorkersSummaryComponent } from './care-workforce-pathway-workers-summary/care-workforce-pathway-workers-summary.component';
import { CareWorkforcePathwayRoleComponent } from './care-workforce-pathway/care-workforce-pathway.component';
import { ContractWithZeroHoursComponent } from './contract-with-zero-hours/contract-with-zero-hours.component';
import { CountryOfBirthComponent } from './country-of-birth/country-of-birth.component';
import { DateOfBirthComponent } from './date-of-birth/date-of-birth.component';
import { DaysOfSicknessComponent } from './days-of-sickness/days-of-sickness.component';
import { DeleteAnotherStaffRecordComponent } from './delete-another-staff-record/delete-another-staff-record.component';
import { DeleteStaffRecordComponent } from './delete-staff-record/delete-staff-record.component';
import { DisabilityComponent } from './disability/disability.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { EmployedFromOutsideUkComponent } from './employed-from-outside-uk/employed-from-outside-uk.component';
import { EthnicityComponent } from './ethnicity/ethnicity.component';
import { GenderComponent } from './gender/gender.component';
import { HealthAndCareVisaComponent } from './health-and-care-visa/health-and-care-visa.component';
import { HomePostcodeComponent } from './home-postcode/home-postcode.component';
import { Level2AdultSocialCareCertificateComponent } from './level-2-adult-social-care-certificate/level-2-adult-social-care-certificate.component';
import { LongTermAbsenceComponent } from './long-term-absence/long-term-absence.component';
import { MainJobRoleComponent } from './main-job-role/main-job-role.component';
import { MainJobStartDateComponent } from './main-job-start-date/main-job-start-date.component';
import { MandatoryDetailsComponent } from './mandatory-details/mandatory-details.component';
import { MentalHealthProfessionalComponent } from './mental-health-professional/mental-health-professional.component';
import { NationalInsuranceNumberComponent } from './national-insurance-number/national-insurance-number.component';
import { NationalityComponent } from './nationality/nationality.component';
import { NursingCategoryComponent } from './nursing-category/nursing-category.component';
import { NursingSpecialismComponent } from './nursing-specialism/nursing-specialism.component';
import { OtherQualificationsLevelComponent } from './other-qualifications-level/other-qualifications-level.component';
import { OtherQualificationsComponent } from './other-qualifications/other-qualifications.component';
import { RecruitedFromComponent } from './recruited-from/recruited-from.component';
import { SalaryComponent } from './salary/salary.component';
import { SelectRecordTypeComponent } from './select-record-type/select-record-type.component';
import { SocialCareQualificationLevelComponent } from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { StaffRecordComponent } from './staff-record/staff-record.component';
import { TotalStaffChangeComponent } from './total-staff-change/total-staff-change.component';
import { UpdateTotalNumberOfStaffComponent } from './update-workplace-details-after-staff-changes/update-total-number-of-staff/update-total-number-of-staff.component';
import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes/update-workplace-details-after-staff-changes.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';

const routes: Routes = [
  {
    path: 'total-staff',
    canActivate: [CheckPermissionsGuard],
    component: TotalStaffChangeComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Total Staff',
    },
  },
  {
    path: 'update-workplace-details-after-adding-staff',
    children: [
      {
        path: '',
        component: UpdateWorkplaceDetailsAfterStaffChangesComponent,
        data: {
          title: 'Update workplace details',
          flowType: WorkplaceUpdateFlowType.ADD,
        },
        resolve: {
          totalNumberOfStaff: TotalStaffRecordsResolver,
        },
      },
      {
        path: 'update-total-staff',
        component: UpdateTotalNumberOfStaffComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update total number of staff' },
      },
      {
        path: 'update-vacancies',
        component: UpdateVacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update staff vacancies', staffUpdatesView: true },
      },
      {
        path: 'update-starters',
        component: UpdateStartersComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update staff vacancies', staffUpdatesView: true },
      },
      {
        path: 'update-vacancies-job-roles',
        component: SelectJobRolesToAddComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          jobRoleType: JobRoleType.Vacancies,
          title: 'Select job roles to add',
        },
      },
      {
        path: 'update-starters-job-roles',
        component: SelectJobRolesToAddComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          jobRoleType: JobRoleType.Starters,
          title: 'Select job roles to add',
        },
      },
    ],
  },
  {
    path: 'update-workplace-details-after-deleting-staff',
    children: [
      {
        path: '',
        component: UpdateWorkplaceDetailsAfterStaffChangesComponent,
        data: {
          title: 'Update workplace details',
          flowType: WorkplaceUpdateFlowType.DELETE,
        },
        resolve: {
          totalNumberOfStaff: TotalStaffRecordsResolver,
        },
      },
      {
        path: 'update-total-staff',
        component: UpdateTotalNumberOfStaffComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update total number of staff' },
      },
      {
        path: 'update-vacancies',
        component: UpdateVacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update staff vacancies', staffUpdatesView: true },
      },
      {
        path: 'update-vacancies-job-roles',
        component: SelectJobRolesToAddComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          jobRoleType: JobRoleType.Vacancies,
          title: 'Select job roles to add',
        },
      },
      {
        path: 'update-leavers',
        component: UpdateLeaversComponent,
        canActivate: [CheckPermissionsGuard],
        data: { permissions: ['canEditEstablishment'], title: 'Update leavers', staffUpdatesView: true },
      },
      {
        path: 'update-leavers-job-roles',
        component: SelectJobRolesToAddComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          jobRoleType: JobRoleType.Leavers,
          title: 'Select job roles to add',
        },
      },
    ],
  },
  {
    path: 'create-staff-record',
    resolve: { jobs: JobsResolver },
    canActivate: [CheckPermissionsGuard],
    children: [
      {
        path: '',
        redirectTo: 'staff-details',
        pathMatch: 'full',
      },
      {
        path: 'staff-details',
        component: StaffDetailsComponent,
        data: {
          permissions: ['canAddWorker'],
          title: 'Add a Staff Record',
        },
      },
      {
        path: 'main-job-role',
        component: MainJobRoleComponent,
        data: {
          permissions: ['canAddWorker'],
          title: 'Main Job Role',
        },
      },
    ],
  },
  {
    path: 'add-another-staff-record',
    component: AddAnotherStaffRecordComponent,
  },
  {
    path: 'delete-another-staff-record',
    component: DeleteAnotherStaffRecordComponent,
  },
  {
    path: 'care-workforce-pathway-workers-summary',
    component: CareWorkforcePathwayWorkersSummaryComponent,
    canActivate: [RequireCWPAnswerForSomeWorkersGuard],
    resolve: { workersWhoRequireCWPAnswer: GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver },
  },
  {
    path: 'basic-records-save-success',
    canActivate: [CheckPermissionsGuard],
    component: BasicRecordsSaveSuccessComponent,
    data: {
      permissions: ['canAddWorker'],
      title: 'Basic Records Save Success',
    },
  },
  {
    path: 'view-training-category/:categoryId',
    component: ViewTrainingComponent,
    resolve: { training: TrainingRecordsForCategoryResolver },
    data: { title: 'View Training Categories' },
  },
  {
    path: ':id',
    canActivate: [CheckPermissionsGuard],
    component: EditWorkerComponent,
    resolve: { worker: WorkerResolver, jobs: JobsResolver, featureFlags: FeatureFlagsResolver },
    data: {
      permissions: ['canViewWorker'],
    },
    children: [
      {
        path: 'staff-record-summary',
        children: [
          {
            path: '',
            component: StaffRecordComponent,
            data: { title: 'Staff Record' },
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
          {
            path: 'add-qualification',
            resolve: {
              availableQualifications: AvailableQualificationsResolver,
            },
            children: [
              {
                path: '',
                component: SelectQualificationTypeComponent,
                data: { title: 'Add Qualification' },
              },
              {
                path: 'qualification-details',
                component: AddEditQualificationComponent,
                data: { title: 'Add Qualification' },
              },
            ],
          },
          {
            path: 'qualification/:qualificationId',
            children: [
              {
                path: '',
                component: AddEditQualificationComponent,
                data: { title: 'Qualification' },
              },
              {
                path: 'select-qualification-type',
                component: SelectQualificationTypeComponent,
                data: { title: 'Select Qualification Type' },
                resolve: {
                  availableQualifications: AvailableQualificationsResolver,
                },
              },
              {
                path: 'delete',
                component: DeleteRecordComponent,
                data: { title: 'Delete Qualification' },
                resolve: {
                  qualificationRecord: QualificationResolver,
                },
              },
            ],
          },
          {
            path: 'add-training',
            children: [
              {
                path: '',
                component: SelectTrainingCategoryComponent,
                data: { title: 'Add Training' },
                resolve: {
                  trainingCategories: TrainingCategoriesResolver,
                },
              },
              {
                path: 'details',
                component: AddEditTrainingComponent,
                data: { title: 'Add Training' },
              },
            ],
          },
          {
            path: 'training/:trainingRecordId',
            children: [
              {
                path: '',
                component: AddEditTrainingComponent,
                data: { title: 'Training' },
              },
              {
                path: 'delete',
                component: DeleteRecordComponent,
                data: { title: 'Delete Training' },
                resolve: {
                  trainingRecord: TrainingRecordResolver,
                },
              },
            ],
          },
          {
            path: 'training',
            component: NewTrainingAndQualificationsRecordComponent,
            resolve: {
              worker: WorkerResolver,
              trainingAndQualificationRecords: TrainingAndQualificationRecordsResolver,
              expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
              mandatoryTrainingCategories: MandatoryTrainingCategoriesResolver,
            },
            data: { title: 'Training and qualification record' },
          },
          {
            path: 'long-term-absence',
            component: LongTermAbsenceComponent,
            resolve: { longTermAbsenceReasons: LongTermAbsenceResolver, worker: WorkerResolver },
            data: { title: 'Flag long term absence' },
          },
        ],
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
      },
      {
        path: 'mandatory-details',
        children: [
          {
            path: '',
            component: MandatoryDetailsComponent,
            data: { title: 'Staff Record' },
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
          },
        ],
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
      {
        path: 'add-qualification',
        resolve: {
          availableQualifications: AvailableQualificationsResolver,
        },
        children: [
          {
            path: '',
            component: SelectQualificationTypeComponent,
            data: { title: 'Add Qualification' },
          },
          {
            path: 'qualification-details',
            component: AddEditQualificationComponent,
            data: { title: 'Add Qualification' },
          },
        ],
      },
      {
        path: 'qualification/:qualificationId',
        children: [
          {
            path: '',
            component: AddEditQualificationComponent,
            data: { title: 'Qualification' },
          },
          {
            path: 'select-qualification-type',
            component: SelectQualificationTypeComponent,
            data: { title: 'Select Qualification Type' },
            resolve: {
              availableQualifications: AvailableQualificationsResolver,
            },
          },
          {
            path: 'delete',
            component: DeleteRecordComponent,
            data: { title: 'Delete Qualification' },
            resolve: {
              qualificationRecord: QualificationResolver,
            },
          },
        ],
      },
      {
        path: 'add-training',
        children: [
          {
            path: '',
            component: SelectTrainingCategoryComponent,
            data: { title: 'Add Training' },
            resolve: {
              trainingCategories: TrainingCategoriesResolver,
            },
          },
          {
            path: 'details',
            component: AddEditTrainingComponent,
            data: { title: 'Add Training' },
          },
        ],
      },
      {
        path: 'training/:trainingRecordId',
        children: [
          {
            path: '',
            component: AddEditTrainingComponent,
            data: { title: 'Training' },
          },
          {
            path: 'delete',
            component: DeleteRecordComponent,
            data: { title: 'Delete Training' },
            resolve: {
              trainingRecord: TrainingRecordResolver,
            },
          },
        ],
      },
      {
        path: 'training',
        component: NewTrainingAndQualificationsRecordComponent,
        resolve: {
          worker: WorkerResolver,
          trainingAndQualificationRecords: TrainingAndQualificationRecordsResolver,
          expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
          mandatoryTrainingCategories: MandatoryTrainingCategoriesResolver,
        },
        data: { title: 'Training and qualification record' },
      },
      {
        path: 'long-term-absence',
        component: LongTermAbsenceComponent,
        resolve: { longTermAbsenceReasons: LongTermAbsenceResolver, worker: WorkerResolver },
        data: { title: 'Flag long term absence' },
      },
      {
        path: 'delete-staff-record',
        component: DeleteStaffRecordComponent,
        resolve: {
          reasonsForLeaving: WorkerReasonsForLeavingResolver,
          totalNumberOfStaff: TotalStaffRecordsResolver,
        },
        data: {
          permissions: ['canDeleteWorker'],
          title: 'Delete staff record',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkersRoutingModule {}
