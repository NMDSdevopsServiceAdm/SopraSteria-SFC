import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { BenchmarksResolver } from '@core/resolvers/benchmarks.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';
import { RankingsResolver } from '@core/resolvers/rankings.resolver';
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { WorkersResolver } from '@core/resolvers/workers.resolver';

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
      articleList: ArticleListResolver,
    },
    //canActivate: [ParentGuard, HasPermissionsGuard, CheckPermissionsGuard],
    data: {
      permissions: ['canViewEstablishment'],
      title: 'Dashboard',
    },
  },
  {
    path: 'workplace/:establishmentuid',
    component: ViewSubsidiaryWorkplaceComponent,
    data: { title: 'Workplace' },
    resolve: {
      users: AllUsersForEstablishmentResolver,
      subsidiaryResolver: SubsidiaryResolver,
      workers: WorkersResolver,
    },
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
