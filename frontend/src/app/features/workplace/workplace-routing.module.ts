import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { WorkplaceIsAwareOfCwpGuard } from '@core/guards/workplace-is-aware-of-cwp/workplace-is-aware-of-cwp.guard';
import { CareWorkforcePathwayUseReasonsResolver } from '@core/resolvers/care-workforce-pathway-use-reasons.resolver';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from '@core/resolvers/careWorkforcePathway/care-workforce-pathway-workplace-awareness';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { AboutParentsComponent } from '@features/pages/about-parents/about-parents.component';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { SelectMainServiceCqcConfirmComponent } from '@features/workplace/select-main-service/select-main-service-cqc-confirm.component';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { UserAccountEditDetailsComponent } from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import {
  JobRoleType,
  SelectJobRolesToAddComponent,
} from '@shared/components/update-starters-leavers-vacancies/select-job-roles-to-add/select-job-roles-to-add.component';
import { UpdateLeaversComponent } from '@shared/components/update-starters-leavers-vacancies/update-leavers/update-leavers.component';
import { UpdateStartersComponent } from '@shared/components/update-starters-leavers-vacancies/update-starters/update-starters.component';
import { UpdateVacanciesComponent } from '@shared/components/update-starters-leavers-vacancies/update-vacancies/update-vacancies.component';

import { AcceptPreviousCareCertificateComponent } from './accept-previous-care-certificate/accept-previous-care-certificate.component';
import { BenefitsStatutorySickPayComponent } from './benefits-statutory-sick-pay/benefits-statutory-sick-pay.component';
import { CareWorkforcePathwayAwarenessComponent } from './care-workforce-pathway-awareness/care-workforce-pathway-awareness.component';
import { CareWorkforcePathwayUseComponent } from './care-workforce-pathway-use/care-workforce-pathway-use.component';
import { ChangeDataOwnerComponent } from './change-data-owner/change-data-owner.component';
import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts/change-expires-soon-alerts.component';
import { CheckAnswersComponent } from './check-answers/check-answers.component';
import { DataSharingComponent } from './data-sharing/data-sharing.component';
import { DeleteUserAccountComponent } from './delete-user-account/delete-user-account.component';
import { DoYouHaveLeaversComponent } from './do-you-have-leavers/do-you-have-leavers.component';
import { DoYouHaveStartersComponent } from './do-you-have-starters/do-you-have-starters.component';
import { DoYouHaveVacanciesComponent } from './do-you-have-vacancies/do-you-have-vacancies.component';
import { EditWorkplaceComponent } from './edit-workplace/edit-workplace.component';
import { EmployedFromOutsideUkExistingWorkersComponent } from './employed-from-outside-uk-existing-workers/employed-from-outside-uk-existing-workers.component';
import { HealthAndCareVisaExistingWorkers } from './health-and-care-visa-existing-workers/health-and-care-visa-existing-workers.component';
import { HowManyLeaversComponent } from './how-many-leavers/how-many-leavers.component';
import { HowManyStartersComponent } from './how-many-starters/how-many-starters.component';
import { HowManyVacanciesComponent } from './how-many-vacancies/how-many-vacancies.component';
import { OtherServicesComponent } from './other-services/other-services.component';
import { PensionsComponent } from './pensions/pensions.component';
import { RegulatedByCqcComponent } from './regulated-by-cqc/regulated-by-cqc.component';
import { SelectLeaverJobRolesComponent } from './select-leaver-job-roles/select-leaver-job-roles.component';
import { SelectMainServiceComponent } from './select-main-service/select-main-service.component';
import { SelectPrimaryUserDeleteComponent } from './select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from './select-primary-user/select-primary-user.component';
import { SelectStarterJobRolesComponent } from './select-starter-job-roles/select-starter-job-roles.component';
import { SelectVacancyJobRolesComponent } from './select-vacancy-job-roles/select-vacancy-job-roles.component';
import { SelectWorkplaceComponent } from './select-workplace/select-workplace.component';
import { ServiceUsersComponent } from './service-users/service-users.component';
import { ServicesCapacityComponent } from './services-capacity/services-capacity.component';
import { StaffBenefitCashLoyaltyComponent } from './staff-benefit-cash-loyalty/staff-benefit-cash-loyalty.component';
import { StaffBenefitHolidayLeaveComponent } from './staff-benefit-holiday-leave/staff-benefit-holiday-leave.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from './staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StartComponent } from './start/start.component';
import { TotalStaffQuestionComponent } from './total-staff-question/total-staff-question.component';
import { TypeOfEmployerComponent } from './type-of-employer/type-of-employer.component';
import { UserAccountEditPermissionsComponent } from './user-account-edit-permissions/user-account-edit-permissions.component';
import { UsersComponent } from './users/users.component';
import { WorkplaceNameAddressComponent } from './workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: 'view-all-workplaces',
    component: ViewMyWorkplacesComponent,
    resolve: { childWorkplaces: ChildWorkplacesResolver, cqcLocations: GetMissingCqcLocationsResolver },
    canActivate: [ParentGuard],
    data: { title: 'View My Workplaces' },
  },
  {
    path: 'change-data-owner',
    component: ChangeDataOwnerComponent,
    resolve: { establishment: WorkplaceResolver },
    data: { title: 'Change Data Owner' },
  },
  {
    path: 'about-parents',
    component: AboutParentsComponent,
    data: {
      title: 'What you can do as a parent workplace',
    },
    resolve: {
      pages: PageResolver,
    },
  },
  {
    path: ':establishmentuid',
    component: EditWorkplaceComponent,
    resolve: { establishment: WorkplaceResolver },
    canActivate: [HasPermissionsGuard],
    data: { title: 'Workplace' },
    children: [
      {
        path: 'users',
        component: UsersComponent,
        data: {
          title: 'Workplace Users',
        },
        resolve: {
          users: AllUsersForEstablishmentResolver,
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
        resolve: {
          careWorkforcePathwayWorkplaceAwarenessAnswers: CareWorkforcePathwayWorkplaceAwarenessAnswersResolver,
        },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Care Workforce Pathway Awareness',
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
        path: 'health-and-care-visa-existing-workers',
        component: HealthAndCareVisaExistingWorkers,
        canActivate: [CheckPermissionsGuard],
        resolve: {
          workers: WorkersResolver,
        },
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkplaceRoutingModule {}
