import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';
import { WdfClaimsGuard } from '@core/guards/wdf-claims/wdf-claims.guard';

import { GrantLetterCheckDetailsComponent } from './wdf-grant-letter/grant-letter-check-details/grant-letter-check-details.component';
import { GrantLetterSentComponent } from './wdf-grant-letter/grant-letter-sent/grant-letter-sent.component';
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
    data: {
      permissions: ['canManageWdfClaims'],
    },
    children: [
      {
        path: '',
        component: WdfGrantLetterComponent,
        data: {
          title: 'WDF Grant Letter',
        },
      },
      {
        path: 'check-details',
        component: GrantLetterCheckDetailsComponent,
        canActivate: [WdfClaimsGuard],
        data: {
          title: 'WDF Grant Letter Check Details',
        },
      },
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
