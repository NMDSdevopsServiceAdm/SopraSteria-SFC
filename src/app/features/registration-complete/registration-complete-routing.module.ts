import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationCompleteComponent } from './registration-complete.component';

const routes: Routes = [
  {
    path: 'default',
    component: RegistrationCompleteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationCompleteRoutingModule { }
