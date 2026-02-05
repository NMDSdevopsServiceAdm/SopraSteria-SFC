import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { RequireCWPAnswerForSomeWorkersGuard } from '@core/guards/require-cwp-answer-for-some-workers/require-cwp-answer-for-some-workers.guard';
import { AvailableQualificationsResolver } from '@core/resolvers/available-qualification.resolver';
import { GetWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from '@core/resolvers/careWorkforcePathway/get-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
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
import { IncludeTrainingCourseDetailsComponent } from '@features/training-and-qualifications/include-training-course-details/include-training-course-details.component';
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
import { SocialCareQualificationLevelComponent } from './social-care-qualification-level/social-care-qualification-level.component';
import { SocialCareQualificationComponent } from './social-care-qualification/social-care-qualification.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { StaffRecordComponent } from './staff-record/staff-record.component';
import { TotalStaffChangeComponent } from './total-staff-change/total-staff-change.component';
import { UpdateTotalNumberOfStaffComponent } from './update-workplace-details-after-staff-changes/update-total-number-of-staff/update-total-number-of-staff.component';
import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes/update-workplace-details-after-staff-changes.component';
import { WeeklyContractedHoursComponent } from './weekly-contracted-hours/weekly-contracted-hours.component';
import { YearArrivedUkComponent } from './year-arrived-uk/year-arrived-uk.component';
import { CarryOutDelegatedHealthcareActivitiesComponent } from './carry-out-delegated-healthcare-activities/carry-out-delegated-healthcare-activities.component';
import { WhoCarryOutDelegatedHealthcareActivitiesComponent } from './who-carry-out-delegated-healthcare-activities/who-carry-out-delegated-healthcare-activities.component';
import { GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver } from '@core/resolvers/delegated-healthcare-activities/get-workers-with-delegated-healthcare-activities-unanswered.resolver';
import { GetDelegatedHealthcareActivitiesResolver } from '@core/resolvers/delegated-healthcare-activities/get-delegated-healthcare-activities.resolver';
import { WorkerHasAnyTrainingOrQualificationsResolver } from '@core/resolvers/worker-has-any-training-or-qualifications.resolver';
import { DoYouWantToDowloadTrainAndQualsComponent } from './do-you-want-to-download-train-and-quals/do-you-want-to-download-train-and-quals.component';
import { TrainingCourseResolver, TrainingCoursesToLoad } from '@core/resolvers/training/training-course.resolver';
import { TrainingCourseMatchingLayoutComponent } from '@features/training-and-qualifications/training-course/training-course-matching-layout/training-course-matching-layout.component';
import { SelectTrainingCourseForWorkerTraining } from '@features/training-and-qualifications/select-training-course-for-worker-training/select-training-course-for-worker-training.component';
import { TrainingProvidersResolver } from '@core/resolvers/training/training-providers.resolver';
import { redirectIfLinkedToTrainingCourse } from '@core/guards/redirect-if-linked-to-training-course/redirect-if-linked-to-training-course.guard';

const editTrainingRecordRoute = {
  path: 'training/:trainingRecordId',
  resolve: { trainingRecord: TrainingRecordResolver },
  children: [
    {
      path: '',
      redirectTo: 'edit-training-without-course',
      pathMatch: 'full',
    },
    {
      path: 'edit-training-without-course',
      component: AddEditTrainingComponent,
      data: {
        title: 'Training',
        trainingCoursesToLoad: TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID,
        routeForTrainingRecordWithCourse: ['../edit-training-with-course'],
      },
      resolve: {
        trainingCourses: TrainingCourseResolver,
        trainingProviders: TrainingProvidersResolver,
      },
      canActivate: [redirectIfLinkedToTrainingCourse],
    },
    {
      path: 'edit-training-with-course',
      component: TrainingCourseMatchingLayoutComponent,
      data: {
        title: 'Training record details',
        trainingCoursesToLoad: TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID,
      },
      resolve: {
        trainingRecord: TrainingRecordResolver,
        trainingCourses: TrainingCourseResolver,
      },
    },
    {
      path: 'include-training-course-details',
      component: IncludeTrainingCourseDetailsComponent,
      data: {
        title: 'Include training course details',
        trainingCoursesToLoad: TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID,
      },
      resolve: {
        trainingCourses: TrainingCourseResolver,
      },
    },
    {
      path: 'delete',
      component: DeleteRecordComponent,
      data: { title: 'Delete Training' },
      resolve: {
        trainingRecord: TrainingRecordResolver,
      },
    },

    {
      path: 'matching-layout',
      component: TrainingCourseMatchingLayoutComponent,
      data: {
        title: 'Match the training record',
        trainingCoursesToLoad: TrainingCoursesToLoad.BY_TRAINING_RECORD_CATEGORY_ID,
      },
      resolve: {
        trainingRecord: TrainingRecordResolver,
        trainingCourses: TrainingCourseResolver,
      },
    },
  ] as Routes,
};

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
        path: 'update-vacancy-job-roles',
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
        path: 'update-starter-job-roles',
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
        path: 'update-vacancy-job-roles',
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
        path: 'update-leaver-job-roles',
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
    path: 'who-carry-out-delegated-healthcare-activities',
    component: WhoCarryOutDelegatedHealthcareActivitiesComponent,
    resolve: {
      workerWhoRequireDHAAnswer: GetWorkersWhoRequireDelegatedHealthcareActivitiesAnswerResolver,
      delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver,
    },
    data: {
      title: 'Who Carry out Delegated Healthcare Activities',
    },
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
    resolve: { worker: WorkerResolver, jobs: JobsResolver },
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
            resolve: { workerHasAnyTrainingOrQualifications: WorkerHasAnyTrainingOrQualificationsResolver },
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
            path: 'carry-out-delegated-healthcare-activities',
            component: CarryOutDelegatedHealthcareActivitiesComponent,
            resolve: { delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver },
            data: { title: 'Carry out Delegated Healthcare Activities' },
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
            path: 'add-training-without-course',
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
                resolve: {
                  trainingProviders: TrainingProvidersResolver,
                },
              },
            ],
          },
          editTrainingRecordRoute,
          {
            path: 'training',
            component: NewTrainingAndQualificationsRecordComponent,
            resolve: {
              worker: WorkerResolver,
              trainingAndQualificationRecords: TrainingAndQualificationRecordsResolver,
              expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
              mandatoryTrainingCategories: MandatoryTrainingCategoriesResolver,
              trainingCourses: TrainingCourseResolver,
            },
            data: { title: 'Training and qualification record', trainingCoursesToLoad: TrainingCoursesToLoad.ALL },
          },
          {
            path: 'add-a-training-record',
            component: SelectTrainingCourseForWorkerTraining,
            data: {
              title: 'Add a Training Record',
              trainingCoursesToLoad: TrainingCoursesToLoad.BY_QUERY_PARAM,
              redirectWhenNoCourses: ['../add-training-without-course'],
            },
            resolve: { trainingCourses: TrainingCourseResolver },
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
        path: 'carry-out-delegated-healthcare-activities',
        component: CarryOutDelegatedHealthcareActivitiesComponent,
        resolve: { delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver },
        data: { title: 'Carry out Delegated Healthcare Activities' },
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
        path: 'add-training-without-course',
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
            resolve: {
              trainingProviders: TrainingProvidersResolver,
            },
          },
        ],
      },
      editTrainingRecordRoute,
      {
        path: 'training',
        component: NewTrainingAndQualificationsRecordComponent,
        resolve: {
          worker: WorkerResolver,
          trainingAndQualificationRecords: TrainingAndQualificationRecordsResolver,
          expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
          mandatoryTrainingCategories: MandatoryTrainingCategoriesResolver,
          trainingCourses: TrainingCourseResolver,
        },
        data: { title: 'Training and qualification record' },
      },
      {
        path: 'add-a-training-record',
        component: SelectTrainingCourseForWorkerTraining,
        resolve: { trainingCourses: TrainingCourseResolver },
        data: {
          title: 'Add a Training Record',
          trainingCoursesToLoad: TrainingCoursesToLoad.BY_QUERY_PARAM,
          redirectWhenNoCourses: ['../add-training-without-course'],
        },
      },
      {
        path: 'matching-layout',
        component: TrainingCourseMatchingLayoutComponent,
        resolve: { trainingCourses: TrainingCourseResolver },
        data: {
          title: 'Add training record details',
        },
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
          workerHasAnyTrainingOrQualifications: WorkerHasAnyTrainingOrQualificationsResolver,
        },
        data: {
          permissions: ['canDeleteWorker'],
          title: 'Delete staff record',
        },
      },
      {
        path: 'download-staff-training-and-qualifications',
        component: DoYouWantToDowloadTrainAndQualsComponent,
        resolve: {
          worker: WorkerResolver,
          trainingAndQualificationRecords: TrainingAndQualificationRecordsResolver,
          mandatoryTrainingCategories: MandatoryTrainingCategoriesResolver,
        },

        data: {
          permissions: ['canDeleteWorker'],
          title: 'Download staff training and qualifications',
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
