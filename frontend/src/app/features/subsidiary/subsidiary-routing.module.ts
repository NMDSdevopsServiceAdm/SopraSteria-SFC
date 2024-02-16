import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { ParentGuard } from '@core/guards/parent/parent.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { ChildWorkplacesResolver } from '@core/resolvers/child-workplaces.resolver';
import { ViewMyWorkplacesComponent } from '@features/workplace/view-my-workplaces/view-my-workplaces.component';
import { ViewWorkplaceComponent } from '@features/workplace/view-workplace/view-workplace.component';

import { GetMissingCqcLocationsResolver } from '@core/resolvers/getMissingCqcLocations/getMissingCqcLocations.resolver';
import { ViewSubsidiaryWorkplaceComponent } from './view-subsidiary-workplace.component';

// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: ':subsidiaryId',
    redirectTo: 'dashboard/:subsidiaryId',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Dashboard' },
  },
  {
    path: 'workplace/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Workplace' },
  },
  {
    path: 'staff-records/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Staff Records' },
  },
  {
    path: 'training-and-qualifications/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Training and qualifications' },
  },
  {
    path: 'benchmarks/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Benchmarks' },
  },
  {
    path: 'workplace-users/:subsidiaryId',
    component: ViewSubsidiaryWorkplaceComponent,
    resolve: { },
    canActivate: [ParentGuard],
    data: { title: 'Workplace users' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubsidiaryRoutingModule {}
