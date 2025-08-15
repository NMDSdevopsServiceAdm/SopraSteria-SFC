import 'core-js';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { WorkplaceIsAwareOfCwpGuard } from '@core/guards/workplace-is-aware-of-cwp/workplace-is-aware-of-cwp.guard';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { CareWorkforcePathwayUseReasonsResolver } from '@core/resolvers/care-workforce-pathway-use-reasons.resolver';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from '@core/resolvers/careWorkforcePathway/care-workforce-pathway-workplace-awareness';
import { GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver } from '@core/resolvers/careWorkforcePathway/no-of-workers-with-care-workforce-pathway-category-role-unanswered.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { GetDelegatedHealthcareActivitiesResolver } from '@core/resolvers/delegated-healthcare-activities/get-delegated-healthcare-activities.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver } from '@core/resolvers/international-recruitment/no-of-workers-who-require-international-recruitment-answers.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { UsefulLinkPayResolver } from '@core/resolvers/useful-link-pay.resolver';
import { UsefulLinkRecruitmentResolver } from '@core/resolvers/useful-link-recruitment.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { AscWdsCertificateComponent } from '@features/dashboard/asc-wds-certificate/asc-wds-certificate.component';
import { DeleteWorkplaceComponent } from '@features/new-dashboard/delete-workplace/delete-workplace.component';
import { StaffBasicRecord } from '@features/new-dashboard/staff-tab/staff-basic-record/staff-basic-record.component';
import { AcceptPreviousCareCertificateComponent } from '@features/workplace/accept-previous-care-certificate/accept-previous-care-certificate.component';
import { BenefitsStatutorySickPayComponent } from '@features/workplace/benefits-statutory-sick-pay/benefits-statutory-sick-pay.component';
import { CareWorkforcePathwayAwarenessComponent } from '@features/workplace/care-workforce-pathway-awareness/care-workforce-pathway-awareness.component';
import { CareWorkforcePathwayUseComponent } from '@features/workplace/care-workforce-pathway-use/care-workforce-pathway-use.component';
import { ChangeExpiresSoonAlertsComponent } from '@features/workplace/change-expires-soon-alerts/change-expires-soon-alerts.component';
import { CheckAnswersComponent } from '@features/workplace/check-answers/check-answers.component';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { DataSharingComponent } from '@features/workplace/data-sharing/data-sharing.component';
import { DeleteUserAccountComponent } from '@features/workplace/delete-user-account/delete-user-account.component';
import { DoYouHaveLeaversComponent } from '@features/workplace/do-you-have-leavers/do-you-have-leavers.component';
import { DoYouHaveStartersComponent } from '@features/workplace/do-you-have-starters/do-you-have-starters.component';
import { DoYouHaveVacanciesComponent } from '@features/workplace/do-you-have-vacancies/do-you-have-vacancies.component';
import { EditWorkplaceComponent } from '@features/workplace/edit-workplace/edit-workplace.component';
import { EmployedFromOutsideUkExistingWorkersComponent } from '@features/workplace/employed-from-outside-uk-existing-workers/employed-from-outside-uk-existing-workers.component';
import { HealthAndCareVisaExistingWorkers } from '@features/workplace/health-and-care-visa-existing-workers/health-and-care-visa-existing-workers.component';
import { HowManyLeaversComponent } from '@features/workplace/how-many-leavers/how-many-leavers.component';
import { HowManyStartersComponent } from '@features/workplace/how-many-starters/how-many-starters.component';
import { HowManyVacanciesComponent } from '@features/workplace/how-many-vacancies/how-many-vacancies.component';
import { OtherServicesComponent } from '@features/workplace/other-services/other-services.component';
import { PensionsComponent } from '@features/workplace/pensions/pensions.component';
import { RegulatedByCqcComponent } from '@features/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectLeaverJobRolesComponent } from '@features/workplace/select-leaver-job-roles/select-leaver-job-roles.component';
import { SelectMainServiceCqcConfirmComponent } from '@features/workplace/select-main-service/select-main-service-cqc-confirm.component';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { SelectPrimaryUserDeleteComponent } from '@features/workplace/select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from '@features/workplace/select-primary-user/select-primary-user.component';
import { SelectStarterJobRolesComponent } from '@features/workplace/select-starter-job-roles/select-starter-job-roles.component';
import { SelectVacancyJobRolesComponent } from '@features/workplace/select-vacancy-job-roles/select-vacancy-job-roles.component';
import { SelectWorkplaceComponent } from '@features/workplace/select-workplace/select-workplace.component';
import { ServiceUsersComponent } from '@features/workplace/service-users/service-users.component';
import { ServicesCapacityComponent } from '@features/workplace/services-capacity/services-capacity.component';
import { StaffBenefitCashLoyaltyComponent } from '@features/workplace/staff-benefit-cash-loyalty/staff-benefit-cash-loyalty.component';
import { StaffBenefitHolidayLeaveComponent } from '@features/workplace/staff-benefit-holiday-leave/staff-benefit-holiday-leave.component';
import { StaffDoDelegatedHealthcareActivitiesComponent } from '@features/workplace/staff-do-delegated-healthcase-activities/staff-do-delegated-healthcare-activities.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from '@features/workplace/staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StartComponent } from '@features/workplace/start/start.component';
import { TotalStaffQuestionComponent } from '@features/workplace/total-staff-question/total-staff-question.component';
import { TypeOfEmployerComponent } from '@features/workplace/type-of-employer/type-of-employer.component';
import { UserAccountEditDetailsComponent } from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountEditPermissionsComponent } from '@features/workplace/user-account-edit-permissions/user-account-edit-permissions.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { WorkplaceNameAddressComponent } from '@features/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from '@features/workplace/workplace-not-found/workplace-not-found.component';
import {
  JobRoleType,
  SelectJobRolesToAddComponent,
} from '@shared/components/update-starters-leavers-vacancies/select-job-roles-to-add/select-job-roles-to-add.component';
import { UpdateLeaversComponent } from '@shared/components/update-starters-leavers-vacancies/update-leavers/update-leavers.component';
import { UpdateStartersComponent } from '@shared/components/update-starters-leavers-vacancies/update-starters/update-starters.component';
import { UpdateVacanciesComponent } from '@shared/components/update-starters-leavers-vacancies/update-vacancies/update-vacancies.component';

import { ViewSubsidiaryBenchmarksComponent } from './benchmarks/view-subsidiary-benchmarks.component';
import { ViewSubsidiaryHomeComponent } from './home/view-subsidiary-home.component';
import { ViewSubsidiaryStaffRecordsComponent } from './staff-records/view-subsidiary-staff-records.component';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryWorkplaceUsersComponent } from './workplace-users/view-subsidiary-workplace-users.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';
import { StaffWhatKindOfDelegatedHealthcareActivitiesComponent } from '@features/workplace/staff-what-kind-of-delegated-healthcare-activities/staff-what-kind-of-delegated-healthcare-activities.component';
import { WorkplaceStaffDoDHAGuard } from '@core/guards/workplace-staff-do-dha/workplace-staff-do-dha.guard';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/public/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'articles',
    loadChildren: () => import('@features/articles/articles.module').then((m) => m.ArticlesModule),
  },
  {
    path: 'help',
    loadChildren: () => import('@features/help/help.module').then((m) => m.HelpModule),
  },
  {
    path: '',
    loadChildren: () => import('@features/pages/pages.module').then((m) => m.PagesModule),
  },
  {
    path: 'funding',
    loadChildren: () => import('@features/funding/funding.module').then((m) => m.FundingModule),
    data: { title: 'Funding Data' },
  },

  {
    path: 'asc-wds-certificate',
    component: AscWdsCertificateComponent,
    data: { title: 'Certificate' },
  },
  {
    path: 'benefits-bundle',
    loadChildren: () => import('@features/benefits-bundle/benefits-bundle.module').then((m) => m.BenefitsBundleModule),
  },
  {
    path: ':establishmentuid',
    canActivate: [HasPermissionsGuard],
    resolve: {
      users: AllUsersForEstablishmentResolver,
      establishment: WorkplaceResolver,
      workers: WorkersResolver,
      totalStaffRecords: TotalStaffRecordsResolver,
      articleList: ArticleListResolver,
      subsidiary: SubsidiaryResolver,
      benchmarksResolver: BenchmarksResolver,
      rankingsResolver: RankingsResolver,
      usefulLinksPay: UsefulLinkPayResolver,
      usefulLinkRecruitment: UsefulLinkRecruitmentResolver,
      noOfWorkersWhoRequireInternationalRecruitment: GetNoOfWorkersWhoRequireInternationalRecruitmentAnswersResolver,
      noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer:
        GetNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswerResolver,
    },
    children: [
      {
        path: 'home',
        canActivate: [HasPermissionsGuard],
        children: [
          {
            path: '',
            component: ViewSubsidiaryHomeComponent,
            canActivate: [CheckPermissionsGuard],
            data: {
              permissions: ['canViewEstablishment'],
              title: 'Dashboard',
              workerPagination: true,
            },
          },
        ],
      },
      {
        path: 'staff-records',
        component: ViewSubsidiaryStaffRecordsComponent,
        data: { title: 'Staff Records' },
      },
      {
        path: 'training-and-qualifications',
        component: ViewSubsidiaryTrainingAndQualificationsComponent,
        data: { title: 'Training and qualifications' },
      },
      {
        path: 'benchmarks',
        component: ViewSubsidiaryBenchmarksComponent,
        data: { title: 'Benchmarks' },
      },
      {
        path: 'workplace-users',
        component: ViewSubsidiaryWorkplaceUsersComponent,
        data: { title: 'Workplace users' },
      },
      {
        path: 'workplace',
        component: ViewSubsidiaryWorkplaceComponent,
        data: { title: 'Workplace' },
      },
      {
        path: 'delete-workplace',
        component: DeleteWorkplaceComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canDeleteEstablishment'],
          title: 'Delete workplace',
        },
      },
    ],
  },
  {
    path: 'workplace/:establishmentuid',
    component: EditWorkplaceComponent,
    canActivate: [HasPermissionsGuard],
    resolve: {
      users: AllUsersForEstablishmentResolver,
      establishment: WorkplaceResolver,
      workers: WorkersResolver,
      totalStaffRecords: TotalStaffRecordsResolver,
      subsidiary: SubsidiaryResolver,
    },
    children: [
      {
        path: 'benchmarks',
        loadChildren: () =>
          import('@shared/components/benchmarks-tab/benchmarks.module').then((m) => m.BenchmarksModule),

        data: {
          title: 'Benchmarks',
        },
      },
      {
        path: 'data-area',
        loadChildren: () =>
          import('@shared/components/data-area-tab/data-area-tab.module').then((m) => m.DataAreaTabModule),

        data: {
          title: 'Data Area',
        },
      },
      {
        path: 'add-and-manage-mandatory-training',
        loadChildren: () =>
          import('@features/training-and-qualifications/add-mandatory-training/add-mandatory-training.module').then(
            (m) => m.AddMandatoryTrainingModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Add Mandatory Training',
        },
      },
      {
        path: 'start',
        component: StartComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Start',
        },
      },
      {
        path: 'health-and-care-visa-existing-workers',
        component: HealthAndCareVisaExistingWorkers,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Health And Care Visa',
        },
      },
      {
        path: 'employed-from-outside-or-inside-uk',
        component: EmployedFromOutsideUkExistingWorkersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditWorker'],
          title: 'Employed from Outside the UK',
        },
      },
      {
        path: 'regulated-by-cqc',
        component: RegulatedByCqcComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Regulated by CQC',
        },
      },
      {
        path: 'select-workplace',
        component: SelectWorkplaceComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Select Workplace',
        },
      },
      {
        path: 'workplace-not-found',
        component: WorkplaceNotFoundComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Workplace Not Found',
        },
      },
      {
        path: 'update-workplace-details',
        component: WorkplaceNameAddressComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Update Workplace Details',
        },
      },
      {
        path: 'type-of-employer',
        component: TypeOfEmployerComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Type of Employer',
        },
      },
      {
        path: 'main-service',
        component: SelectMainServiceComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Main Service',
        },
      },
      {
        path: 'main-service-cqc',
        component: SelectMainServiceCqcComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Main Service',
        },
      },
      {
        path: 'main-service-cqc-confirm',
        component: SelectMainServiceCqcConfirmComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Main Service',
        },
      },
      {
        path: 'other-services',
        component: OtherServicesComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Other Services',
        },
      },
      {
        path: 'capacity-of-services',
        component: ServicesCapacityComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Capacity of Services',
        },
      },
      {
        path: 'service-users',
        component: ServiceUsersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Service Users',
        },
      },
      {
        path: 'staff-do-delegated-healthcare-activities',
        component: StaffDoDelegatedHealthcareActivitiesComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Staff do delegated healthcare activities',
        },
      },
      {
        path: 'what-kind-of-delegated-healthcare-activities',
        component: StaffWhatKindOfDelegatedHealthcareActivitiesComponent,
        canActivate: [CheckPermissionsGuard, WorkplaceStaffDoDHAGuard],
        resolve: { delegatedHealthcareActivities: GetDelegatedHealthcareActivitiesResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'What kind of delegated healthcare activities',
        },
      },
      {
        path: 'sharing-data',
        component: DataSharingComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Share Data',
        },
      },
      {
        path: 'total-staff',
        component: TotalStaffQuestionComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Total Staff',
        },
      },
      {
        path: 'do-you-have-vacancies',
        component: DoYouHaveVacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Do You Have Vacancies',
        },
      },
      {
        path: 'select-vacancy-job-roles',
        component: SelectVacancyJobRolesComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Vacancies job role selection',
        },
      },
      {
        path: 'how-many-vacancies',
        component: HowManyVacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'How many vacancies',
        },
      },
      {
        path: 'update-vacancies',
        component: UpdateVacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Update Vacancies',
        },
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
        path: 'do-you-have-starters',
        component: DoYouHaveStartersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Do You Have Starters',
        },
      },
      {
        path: 'select-starter-job-roles',
        component: SelectStarterJobRolesComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Starters job role selection',
        },
      },
      {
        path: 'how-many-starters',
        component: HowManyStartersComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'How many starters',
        },
      },
      {
        path: 'update-starters',
        component: UpdateStartersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Update Starters',
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
      {
        path: 'do-you-have-leavers',
        component: DoYouHaveLeaversComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Do You Have Leavers',
        },
      },
      {
        path: 'select-leaver-job-roles',
        component: SelectLeaverJobRolesComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Leavers job role selection',
        },
      },
      {
        path: 'how-many-leavers',
        component: HowManyLeaversComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'How many leavers',
        },
      },
      {
        path: 'update-leavers',
        component: UpdateLeaversComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Update Leavers',
        },
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
      {
        path: 'staff-recruitment-capture-training-requirement',
        component: StaffRecruitmentCaptureTrainingRequirementComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Staff Recruitment Capture Training Requirement',
        },
      },
      {
        path: 'staff-benefit-holiday-leave',
        component: StaffBenefitHolidayLeaveComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Staff Benefit Holiday Leave',
        },
      },
      {
        path: 'accept-previous-care-certificate',
        component: AcceptPreviousCareCertificateComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Accept Previous Care Certificate',
        },
      },
      {
        path: 'care-workforce-pathway-awareness',
        component: CareWorkforcePathwayAwarenessComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Care Workforce Pathway Awareness',
        },
        resolve: {
          careWorkforcePathwayWorkplaceAwarenessAnswers: CareWorkforcePathwayWorkplaceAwarenessAnswersResolver,
        },
      },
      {
        path: 'care-workforce-pathway-use',
        component: CareWorkforcePathwayUseComponent,
        canActivate: [CheckPermissionsGuard, WorkplaceIsAwareOfCwpGuard],
        resolve: { careWorkforcePathwayUseReasons: CareWorkforcePathwayUseReasonsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Care workforce pathway use',
        },
      },
      {
        path: 'cash-loyalty',
        component: StaffBenefitCashLoyaltyComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Cash Loyalty',
        },
      },

      {
        path: 'benefits-statutory-sick-pay',
        component: BenefitsStatutorySickPayComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Benefits Statutory Sick Pay',
        },
      },
      {
        path: 'check-answers',
        component: CheckAnswersComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Check Answers',
        },
      },
      {
        path: 'pensions',
        component: PensionsComponent,
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Pensions',
        },
      },
      {
        path: 'user/create',
        canActivate: [CheckPermissionsGuard],
        component: CreateUserAccountComponent,
        data: {
          permissions: ['canAddUser'],
          title: 'Create User Account',
        },
      },
      {
        path: 'user/saved/:useruid',
        canActivate: [CheckPermissionsGuard],
        component: UserAccountSavedComponent,
        resolve: { user: UserAccountResolver },
        data: {
          permissions: ['canAddUser'],
          title: 'User has been added',
        },
      },
      {
        path: 'user/:useruid',
        data: { title: 'View User Account' },
        children: [
          {
            path: '',
            component: UserAccountViewComponent,
            resolve: { user: UserAccountResolver },
          },
          {
            path: 'permissions',
            component: UserAccountEditPermissionsComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Edit Permissions',
            },
          },
          {
            path: 'select-primary-user',
            component: SelectPrimaryUserComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Select primary user',
            },
          },
          {
            path: 'select-primary-user-delete',
            component: SelectPrimaryUserDeleteComponent,
            canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Select primary user to delete',
            },
          },
          {
            path: 'edit-details',
            component: UserAccountEditDetailsComponent,
            canActivate: [CheckPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canEditUser'],
              title: 'Edit User Details',
            },
          },
          {
            path: 'delete-user',
            component: DeleteUserAccountComponent,
            canActivate: [CheckPermissionsGuard],
            resolve: { user: UserAccountResolver },
            data: {
              permissions: ['canDeleteUser'],
              title: 'Delete User',
            },
          },
        ],
      },
      {
        path: 'staff-record',
        loadChildren: () => import('@features/workers/workers.module').then((m) => m.WorkersModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Staff Records',
        },
      },
      {
        path: 'training-and-qualifications',
        loadChildren: () =>
          import('@features/training-and-qualifications/training-and-qualifications.module').then(
            (m) => m.TrainingAndQualificationsModule,
          ),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Training and qualifications',
        },
      },
      {
        path: 'training-and-qualifications-record',
        loadChildren: () => import('@features/workers/workers.module').then((m) => m.WorkersModule),
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canViewWorker'],
          title: 'Training and qualifications record',
        },
      },
      {
        path: 'add-multiple-training',
        loadChildren: () =>
          import('@features/training-and-qualifications/add-multiple-training/add-multiple-training.module').then(
            (m) => m.AddMultipleTrainingModule,
          ),
        data: { title: 'Add Multiple Training' },
      },
      {
        path: 'change-expires-soon-alerts',
        component: ChangeExpiresSoonAlertsComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: {
          expiresSoonAlertDate: ExpiresSoonAlertDatesResolver,
        },
        data: { permissions: ['canEditEstablishment'], title: 'Change expires soon alerts' },
      },
    ],
  },
  {
    path: 'staff-basic-records/:establishmentuid',
    component: StaffBasicRecord,
    resolve: {
      establishment: WorkplaceResolver,
      workers: WorkersResolver,
    },
    data: { title: 'Staff Basic Records' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubsidiaryRoutingModule {}
