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
import {
  ViewSubsidiaryTrainingAndQualificationsComponent,
} from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryWorkplaceUsersComponent } from './workplace-users/view-subsidiary-workplace-users.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';


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
        path: 'edit',
        component: EditWorkplaceComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Edit Workplace',
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
        }
      },
      {
        path: 'other-services',
        component: RegulatedByCqcComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Regulated by CQC',
        }
      },
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
