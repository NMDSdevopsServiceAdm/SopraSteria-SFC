import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';

import { AddLearnersStartPageComponent } from './add-learners-start-page/add-learners-start-page.component';
import { GrantLetterSentComponent } from './wdf-grant-letter/grant-leter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

const routes: Routes = [
  {
    path: 'grant-letter',
    canActivate: [HasPermissionsGuard],
    data: {
      permissions: ['canManageWdfClaims'],
    },
    children: [
      {
        path: '',
        component: WdfGrantLetterComponent,
        data: { title: 'WDF Grant Letter' },
      },
      {
        path: 'grant-letter-sent',
        component: GrantLetterSentComponent,
        data: { title: 'WDF Grant Letter sent' },
      },
    ],
  },
  {
    path: 'add-learners',
    canActivate: [HasPermissionsGuard],
    data: {
      permissions: ['canManageWdfClaims'],
    },
    children: [
      {
        path: '',
        component: AddLearnersStartPageComponent,
        data: { title: 'Add learners' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfClaimsRoutingModule {}
