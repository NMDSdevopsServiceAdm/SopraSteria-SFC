import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';

import { GrantLetterSentComponent } from './wdf-grant-letter/grant-leter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grant-letter',
    pathMatch: 'full',
  },
  {
    path: 'grant-letter',
    canActivate: [HasPermissionsGuard],
    component: WdfGrantLetterComponent,
    data: {
      permissions: ['canManageWdfClaims'],
      data: { title: 'WDF Grant Letter' },
    },
    children: [
      {
        path: 'grant-letter-sent',
        component: GrantLetterSentComponent,
        data: { title: 'WDF Grant Letter sent' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfClaimsRoutingModule {}
