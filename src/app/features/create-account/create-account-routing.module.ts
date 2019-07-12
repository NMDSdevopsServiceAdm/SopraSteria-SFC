import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAccountComponent } from '@features/create-account/create-account/create-account.component';
import { CreateUsernameComponent } from '@features/create-account/create-username/create-username.component';

const routes: Routes = [
  {
    path: '',
    component: CreateAccountComponent,
  },
  {
    path: 'create-username',
    component: CreateUsernameComponent,
    data: { title: 'Create Username' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAccountRoutingModule {}
