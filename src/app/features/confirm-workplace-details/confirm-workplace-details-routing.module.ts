import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

const routes: Routes = [
  {
    path: 'default',
    component: ConfirmWorkplaceDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmWorkplaceDetailsRoutingModule { }
