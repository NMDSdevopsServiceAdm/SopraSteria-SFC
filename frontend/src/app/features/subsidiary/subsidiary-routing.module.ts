import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { EditWorkplaceComponent } from '@features/workplace/edit-workplace/edit-workplace.component';
import { RegulatedByCqcComponent } from '@features/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { StaffRecruitmentStartComponent } from '@features/workplace/staff-recruitment/staff-recruitment-start.component';
import { StartComponent } from '@features/workplace/start/start.component';
import { UsersComponent } from '@features/workplace/users/users.component';

import { ViewSubsidiaryBenchmarksComponent } from './benchmarks/view-subsidiary-benchmarks.component';
import { ViewSubsidiaryHomeComponent } from './home/view-subsidiary-home.component';
import { ViewSubsidiaryStaffRecordsComponent } from './staff-records/view-subsidiary-staff-records.component';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryWorkplaceUsersComponent } from './workplace-users/view-subsidiary-workplace-users.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';

import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { SelectWorkplaceComponent } from '@features/workplace/select-workplace/select-workplace.component';
import { WorkplaceNotFoundComponent } from '@features/workplace/workplace-not-found/workplace-not-found.component';
import { WorkplaceNameAddressComponent } from '@features/workplace/workplace-name-address/workplace-name-address.component';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: ':establishmentuid',
    redirectTo: 'dashboard/:establishmentuid',
    pathMatch: 'full',
  },
  {
    path: 'home/:establishmentuid',
    component: ViewSubsidiaryHomeComponent,
    resolve: {
      users: AllUsersForEstablishmentResolver,
      subsidiaryResolver: SubsidiaryResolver,
      workers: WorkersResolver,
      totalStaffRecords: TotalStaffRecordsResolver,
      articleList: ArticleListResolver,
    },
    canActivate: [CheckPermissionsGuard, HasPermissionsGuard],
    data: {
      permissions: ['canViewEstablishment'],
      title: 'Dashboard',
      workerPagination: true,
    },
  },
  {
    path: 'workplace/:establishmentuid',
    component: EditWorkplaceComponent,
    data: { title: 'Workplace' },
    resolve: {
      users: AllUsersForEstablishmentResolver,
      subsidiaryResolver: SubsidiaryResolver,
      workers: WorkersResolver,
      totalStaffRecords: TotalStaffRecordsResolver,
    },
    children: [
      {
        path: '',
        component: ViewSubsidiaryWorkplaceComponent,
        // resolve: {
        //   users: AllUsersForEstablishmentResolver,
        //   subsidiaryResolver: SubsidiaryResolver,
        //   workers: WorkersResolver,
        // },
        data: { title: 'Workplace' },
      },
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
        path: 'staff-recruitment-start',
        component: StaffRecruitmentStartComponent,
        data: {
          title: 'Staff Recruitment Start',
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
      // {
      //   path: 'type-of-employer',
      //   component: TypeOfEmployerComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Type of Employer',
      //   },
      // },
      // {
      //   path: 'main-service',
      //   component: SelectMainServiceComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Main Service',
      //   },
      // },
      {
        path: 'main-service-cqc',
        component: SelectMainServiceCqcComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Main Service',
        },
      },
      // {
      //   path: 'main-service-cqc-confirm',
      //   component: SelectMainServiceCqcConfirmComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Main Service',
      //   },
      // },
      // {
      //   path: 'other-services',
      //   component: OtherServicesComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Other Services',
      //   },
      // },
      // {
      //   path: 'capacity-of-services',
      //   component: ServicesCapacityComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Capacity of Services',
      //   },
      // },
      // {
      //   path: 'service-users',
      //   component: ServiceUsersComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Service Users',
      //   },
      // },
      // {
      //   path: 'sharing-data',
      //   component: DataSharingComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Share Data',
      //   },
      // },
      // {
      //   path: 'total-staff',
      //   component: TotalStaffQuestionComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Total Staff',
      //   },
      // },
      // {
      //   path: 'vacancies',
      //   component: VacanciesComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   resolve: { jobs: JobsResolver },
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Vacancies',
      //   },
      // },
      // {
      //   path: 'starters',
      //   component: StartersComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   resolve: { jobs: JobsResolver },
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Starters',
      //   },
      // },
      // {
      //   path: 'leavers',
      //   component: LeaversComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   resolve: { jobs: JobsResolver },
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Leavers',
      //   },
      // },
      // {
      //   path: 'recruitment-advertising-cost',
      //   component: RecruitmentAdvertisingCostComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Recruitment Advertising Cost',
      //   },
      // },
      // {
      //   path: 'number-of-interviews',
      //   component: NumberOfInterviewsComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Number Of Interviews',
      //   },
      // },
      // {
      //   path: 'staff-recruitment-capture-training-requirement',
      //   component: StaffRecruitmentCaptureTrainingRequirementComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Staff Recruitment Capture Training Requirement',
      //   },
      // },
      // {
      //   path: 'confirm-staff-recruitment-and-benefits',
      //   component: ConfirmStaffRecruitmentAndBenefitsComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Confirm Staff Recruitment And Benefits',
      //   },
      // },
      // {
      //   path: 'staff-benefit-holiday-leave',
      //   component: StaffBenefitHolidayLeaveComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Staff Benefit Holiday Leave',
      //   },
      // },
      // {
      //   path: 'accept-previous-care-certificate',
      //   component: AcceptPreviousCareCertificateComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Accept Previous Care Certificate',
      //   },
      // },
      // {
      //   path: 'cash-loyalty',
      //   component: StaffBenefitCashLoyaltyComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Cash Loyalty',
      //   },
      // },

      // {
      //   path: 'benefits-statutory-sick-pay',
      //   component: BenefitsStatutorySickPayComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Benefits Statutory Sick Pay',
      //   },
      // },
      // {
      //   path: 'check-answers',
      //   component: CheckAnswersComponent,
      //   canActivate: [CheckPermissionsGuard],
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Check Answers',
      //   },
      // },
      // {
      //   path: 'pensions',
      //   component: PensionsComponent,
      //   data: {
      //     permissions: ['canEditEstablishment'],
      //     title: 'Pensions',
      //   },
      // },
      // {
      //   path: 'user/create',
      //   canActivate: [CheckPermissionsGuard],
      //   component: CreateUserAccountComponent,
      //   data: {
      //     permissions: ['canAddUser'],
      //     title: 'Create User Account',
      //   },
      // },
      // {
      //   path: 'user/saved/:useruid',
      //   canActivate: [CheckPermissionsGuard],
      //   component: UserAccountSavedComponent,
      //   resolve: { user: UserAccountResolver },
      //   data: {
      //     permissions: ['canAddUser'],
      //     title: 'User has been added',
      //   },
      // },
      // {
      //   path: 'user/:useruid',
      //   data: { title: 'View User Account' },
      //   children: [
      //     {
      //       path: '',
      //       component: UserAccountViewComponent,
      //       resolve: { user: UserAccountResolver },
      //     },
      //     {
      //       path: 'permissions',
      //       component: UserAccountEditPermissionsComponent,
      //       canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
      //       resolve: { user: UserAccountResolver },
      //       data: {
      //         permissions: ['canEditUser'],
      //         title: 'Edit Permissions',
      //       },
      //     },
      //     {
      //       path: 'select-primary-user',
      //       component: SelectPrimaryUserComponent,
      //       canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
      //       resolve: { user: UserAccountResolver },
      //       data: {
      //         permissions: ['canEditUser'],
      //         title: 'Select primary user',
      //       },
      //     },
      //     {
      //       path: 'select-primary-user-delete',
      //       component: SelectPrimaryUserDeleteComponent,
      //       canActivate: [CheckPermissionsGuard, EditUserPermissionsGuard],
      //       resolve: { user: UserAccountResolver },
      //       data: {
      //         permissions: ['canEditUser'],
      //         title: 'Select primary user to delete',
      //       },
      //     },
      //     {
      //       path: 'edit-details',
      //       component: UserAccountEditDetailsComponent,
      //       canActivate: [CheckPermissionsGuard],
      //       resolve: { user: UserAccountResolver },
      //       data: {
      //         permissions: ['canEditUser'],
      //         title: 'Edit User Details',
      //       },
      //     },
      //     {
      //       path: 'delete-user',
      //       component: DeleteUserAccountComponent,
      //       canActivate: [CheckPermissionsGuard],
      //       resolve: { user: UserAccountResolver },
      //       data: {
      //         permissions: ['canDeleteUser'],
      //         title: 'Delete User',
      //       },
      //     },
      //   ],
      // },
    ]
  },
  {
    path: 'staff-records/:establishmentuid',
    component: ViewSubsidiaryStaffRecordsComponent,
    data: { title: 'Staff Records' },
    resolve: {
      subsidiaryResolver: SubsidiaryResolver,
    },
  },
  {
    path: 'training-and-qualifications/:establishmentuid',
    component: ViewSubsidiaryTrainingAndQualificationsComponent,
    data: { title: 'Training and qualifications' },
    resolve: {
      users: AllUsersForEstablishmentResolver,
      subsidiaryResolver: SubsidiaryResolver,
      workers: WorkersResolver,
    },
  },
  {
    path: 'benchmarks/:establishmentuid',
    component: ViewSubsidiaryBenchmarksComponent,
    data: { title: 'Benchmarks' },
    resolve: {
      subsidiaryResolver: SubsidiaryResolver,
      benchmarksResolver: BenchmarksResolver,
      rankingsResolver: RankingsResolver,

    },
  },
  {
    path: 'workplace-users/:establishmentuid',
    component: ViewSubsidiaryWorkplaceUsersComponent,
    data: { title: 'Workplace users' },
    resolve: {
      subsidiaryResolver: SubsidiaryResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubsidiaryRoutingModule {}
