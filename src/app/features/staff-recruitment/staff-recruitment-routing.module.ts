import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './start/start.component';
import { EditUserPermissionsGuard } from '@core/guards/edit-user-permissions/edit-user-permissions.guard';
import { CheckPermissionsGuard } from '@core/guards/permissions/check-permissions/check-permissions.guard';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { StaffRecruitmentModule } from './staff-recruitment.module';
// eslint-disable-next-line max-len
const routes: Routes = [
  {
    path: ':establishmentuid',
    component: StaffRecruitmentComponent,
    resolve: { establishment: WorkplaceResolver },
    canActivate: [HasPermissionsGuard],
    data: { title: 'Staff Recruitment' },
    children: [
      {
        path: 'start',
        component: StartComponent,
        canActivate: [CheckPermissionsGuard],
        data: {
          permissions: ['canEditEstablishment'],
          title: 'Start',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffRecruitmentRoutingModule {}
