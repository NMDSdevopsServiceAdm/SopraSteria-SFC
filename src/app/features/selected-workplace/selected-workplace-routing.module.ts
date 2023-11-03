import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { TotalStaffRecordsResolver } from '@core/resolvers/dashboard/total-staff-records.resolver';
import { ExpiresSoonAlertDatesResolver } from '@core/resolvers/expiresSoonAlertDates.resolver';
import { JobsResolver } from '@core/resolvers/jobs.resolver';
import { UserAccountResolver } from '@core/resolvers/user-account.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';
import { WorkplaceResolver } from '@core/resolvers/workplace.resolver';
import { CreateUserAccountComponent } from '@features/workplace/create-user-account/create-user-account.component';
import { SelectMainServiceCqcConfirmComponent } from '@features/workplace/select-main-service/select-main-service-cqc-confirm.component';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { UserAccountEditDetailsComponent } from '@features/workplace/user-account-edit-details/user-account-edit-details.component';
import { UserAccountSavedComponent } from '@features/workplace/user-account-saved/user-account-saved.component';
import { UserAccountViewComponent } from '@features/workplace/user-account-view/user-account-view.component';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ViewWorkplaceComponent } from '@features/workplace/view-workplace/view-workplace.component';

import { AcceptPreviousCareCertificateComponent } from '@features/workplace/accept-previous-care-certificate/accept-previous-care-certificate.component';
import { BenefitsStatutorySickPayComponent } from '@features/workplace/benefits-statutory-sick-pay/benefits-statutory-sick-pay.component';
import { ChangeExpiresSoonAlertsComponent } from '@features/workplace/change-expires-soon-alerts/change-expires-soon-alerts.component';
import { CheckAnswersComponent } from '@features/workplace/check-answers/check-answers.component';
import { ConfirmStaffRecruitmentAndBenefitsComponent } from '@features/workplace/confirm-staff-recruitment/confirm-staff-recruitment-and-benefits.component';
import { DataSharingComponent } from '@features/workplace/data-sharing/data-sharing.component';
import { DeleteUserAccountComponent } from '@features/workplace/delete-user-account/delete-user-account.component';
import { EditWorkplaceComponent } from '@features/workplace/edit-workplace/edit-workplace.component';
import { LeaversComponent } from '@features/workplace/leavers/leavers.component';
import { NumberOfInterviewsComponent } from '@features/workplace/number-of-interviews/number-of-interviews.component';
import { OtherServicesComponent } from '@features/workplace/other-services/other-services.component';
import { PensionsComponent } from '@features/workplace/pensions/pensions.component';
import { RecruitmentAdvertisingCostComponent } from '@features/workplace/recruitment-advertising-cost/recruitment-advertising-cost.component';
import { RegulatedByCqcComponent } from '@features/workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { SelectPrimaryUserDeleteComponent } from '@features/workplace/select-primary-user-delete/select-primary-user-delete.component';
import { SelectPrimaryUserComponent } from '@features/workplace/select-primary-user/select-primary-user.component';
import { SelectWorkplaceComponent } from '@features/workplace/select-workplace/select-workplace.component';
import { ServiceUsersComponent } from '@features/workplace/service-users/service-users.component';
import { ServicesCapacityComponent } from '@features/workplace/services-capacity/services-capacity.component';
import { StaffBenefitCashLoyaltyComponent } from '@features/workplace/staff-benefit-cash-loyalty/staff-benefit-cash-loyalty.component';
import { StaffBenefitHolidayLeaveComponent } from '@features/workplace/staff-benefit-holiday-leave/staff-benefit-holiday-leave.component';
import { StaffRecruitmentCaptureTrainingRequirementComponent } from '@features/workplace/staff-recruitment-capture-training-requirement/staff-recruitment-capture-training-requirement.component';
import { StaffRecruitmentStartComponent } from '@features/workplace/staff-recruitment/staff-recruitment-start.component';
import { StartComponent } from '@features/workplace/start/start.component';
import { StartersComponent } from '@features/workplace/starters/starters.component';
import { TotalStaffQuestionComponent } from '@features/workplace/total-staff-question/total-staff-question.component';
import { TypeOfEmployerComponent } from '@features/workplace/type-of-employer/type-of-employer.component';
import { UserAccountEditPermissionsComponent } from '@features/workplace/user-account-edit-permissions/user-account-edit-permissions.component';
import { UsersComponent } from '@features/workplace/users/users.component';
import { VacanciesComponent } from '@features/workplace/vacancies/vacancies.component';
import { WorkplaceNameAddressComponent } from '@features/workplace/workplace-name-address/workplace-name-address.component';
import { WorkplaceNotFoundComponent } from '@features/workplace/workplace-not-found/workplace-not-found.component';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { NewDashboardComponent } from '@features/new-dashboard/dashboard/dashboard.component';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: 'view-all-workplaces',
    component: ViewMyWorkplacesComponent,
    resolve: { childWorkplaces: ChildWorkplacesResolver },
    canActivate: [ParentGuard],
    data: { title: 'View My Workplaces' },
  },
  {
    path: ':establishmentuid',
    component: EditWorkplaceComponent,
    resolve: { establishment: WorkplaceResolver },
    canActivate: [HasPermissionsGuard],
    data: { title: 'Workplace' },
    children: [
      {
        path: '',
        canActivate: [CheckPermissionsGuard],
        component: NewDashboardComponent,
        data: {
          permissions: ['canViewEstablishment'],
          title: 'View Workplace',
          workerPagination: true,
        },
        resolve: {
          users: AllUsersForEstablishmentResolver,
          workers: WorkersResolver,
          totalStaffRecords: TotalStaffRecordsResolver,
        },
      },
      {
        path: 'workplace',
        canActivate: [CheckPermissionsGuard],
        component: ViewWorkplaceComponent,
        data: {
          permissions: ['canViewEstablishment'],
          title: 'View Workplace',
          workerPagination: true,
        },
        resolve: {
          users: AllUsersForEstablishmentResolver,
          workers: WorkersResolver,
          totalStaffRecords: TotalStaffRecordsResolver,
        },
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
        path: 'vacancies',
        component: VacanciesComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Vacancies',
        },
      },
      {
        path: 'starters',
        component: StartersComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Starters',
        },
      },
      {
        path: 'leavers',
        component: LeaversComponent,
        canActivate: [CheckPermissionsGuard],
        resolve: { jobs: JobsResolver },
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Leavers',
        },
      },
      {
        path: 'recruitment-advertising-cost',
        component: RecruitmentAdvertisingCostComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Recruitment Advertising Cost',
        },
      },
      {
        path: 'number-of-interviews',
        component: NumberOfInterviewsComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Number Of Interviews',
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
        path: 'confirm-staff-recruitment-and-benefits',
        component: ConfirmStaffRecruitmentAndBenefitsComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Confirm Staff Recruitment And Benefits',
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
export class SelectedWorkplaceRoutingModule {}
