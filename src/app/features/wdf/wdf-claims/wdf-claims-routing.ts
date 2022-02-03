import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WdfGrantLetterComponent } from './wdf-grant-letter/wdf-grant-letter.component';

const routes: Routes = [
  {
    path: 'grant-letter',
    component: WdfGrantLetterComponent,
    data: { title: 'WDF Grant Letter' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WdfClaimsRoutingModule {}
