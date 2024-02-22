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
import { SubsidiaryResolver } from '@core/resolvers/subsidiary.resolver';
import { SubsidiaryWorkerResolver } from '@core/resolvers/subsidiary-worker.resolver';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: ':subsidiaryUid',
    redirectTo: 'dashboard/:subsidiaryUid',
    pathMatch: 'full',
  },
  {
    path: 'home/:subsidiaryUid',
    component: ViewSubsidiaryHomeComponent,
    data: { title: 'Dashboard' },
  },
  {
    path: 'workplace/:subsidiaryUid',
    component: ViewSubsidiaryWorkplaceComponent,
    data: { title: 'Workplace' },
  },
  {
    path: 'staff-records/:subsidiaryUid',
    component: ViewSubsidiaryStaffRecordsComponent,
    data: { title: 'Staff Records' },
  },
  {
    path: 'training-and-qualifications/:subsidiaryUid',
    component: ViewSubsidiaryTrainingAndQualificationsComponent,
    data: { title: 'Training and qualifications' },
    resolve: {
      subsidiaryWorkplaceResolver: SubsidiaryResolver,
      // subsidiaryWorkerResolver: SubsidiaryWorkerResolver,
    }
  },
  {
    path: 'benchmarks/:subsidiaryUid',
    component: ViewSubsidiaryBenchmarksComponent,
    data: { title: 'Benchmarks' },
  },
  {
    path: 'workplace-users/:subsidiaryUid',
    component: ViewSubsidiaryWorkplaceUsersComponent,
    data: { title: 'Workplace users' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubsidiaryRoutingModule {}
