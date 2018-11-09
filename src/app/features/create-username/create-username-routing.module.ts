import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateUsernameComponent } from './create-username.component';

const routes: Routes = [
  {
    path: 'default',
    component: CreateUsernameComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateUsernameRoutingModule { }
