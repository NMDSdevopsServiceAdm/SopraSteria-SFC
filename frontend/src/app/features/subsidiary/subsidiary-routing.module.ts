import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { ViewSubsidiaryHomeComponent } from './home/view-subsidiary-home.component';
import { ViewSubsidiaryWorkplaceComponent } from './workplace/view-subsidiary-workplace.component';
import { ViewSubsidiaryStaffRecordsComponent } from './staff-records/view-subsidiary-staff-records.component';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './training-and-qualifications/view-subsidiary-training-and-qualifications.component';
import { ViewSubsidiaryBenchmarksComponent } from './benchmarks/view-subsidiary-benchmarks.component';
import { ViewSubsidiaryWorkplaceUsersComponent } from './workplace-users/view-subsidiary-workplace-users.component';

import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { AllUsersForEstablishmentResolver } from '@core/resolvers/dashboard/all-users-for-establishment.resolver';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: ':subsidiaryId',
    redirectTo: 'dashboard/:subsidiaryId',
    pathMatch: 'full',
  },
  {
    path: 'home/:subsidiaryId',
    component: ViewSubsidiaryHomeComponent,
    resolve: { users: AllUsersForEstablishmentResolver },
    canActivate: [ParentGuard, HasPermissionsGuard, CheckPermissionsGuard],
    data: {
      permissions: ['canViewEstablishment'],
      title: 'Dashboard',
    },
  },
  {
    path: 'workplace/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: {},
    canActivate: [ParentGuard],
    data: { title: 'Workplace' },
  },
  {
    path: 'staff-records/:subsidiaryId',
    component: ViewSubsidiaryStaffRecordsComponent,
    resolve: {},
    canActivate: [ParentGuard],
    data: { title: 'Staff Records' },
  },
  {
    path: 'training-and-qualifications/:subsidiaryId',
    component: ViewSubsidiaryTrainingAndQualificationsComponent,
    resolve: {},
    canActivate: [ParentGuard],
    data: { title: 'Training and qualifications' },
  },
  {
    path: 'benchmarks/:subsidiaryId',
    component: ViewSubsidiaryBenchmarksComponent,
    resolve: {},
    canActivate: [ParentGuard],
    data: { title: 'Benchmarks' },
  },
  {
    path: 'workplace-users/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceUsersComponent,
    resolve: {},
    canActivate: [ParentGuard],
    data: { title: 'Workplace users' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubsidiaryRoutingModule {}
