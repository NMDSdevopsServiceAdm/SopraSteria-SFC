import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmAccountDetailsComponent } from './confirm-account-details.component';

const routes: Routes = [
  {
    path: 'default',
    component: ConfirmAccountDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmAccountDetailsRoutingModule { }
