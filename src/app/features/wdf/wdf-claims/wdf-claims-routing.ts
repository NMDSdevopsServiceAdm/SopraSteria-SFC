import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionsGuard } from '@core/guards/permissions/has-permissions/has-permissions.guard';

import { GrantLetterSentComponent } from './wdf-grant-letter/grant-leter-sent/grant-letter-sent.component';
import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

const routes: Routes = [
  {
    path: 'grant-letter',
    children: [
      {
        path: '',
        canActivate: [HasPermissionsGuard],
        component: WdfGrantLetterComponent,
        data: {
          permissions: ['canManageWdfClaims'],
          title: 'WDF Grant Letter',
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
