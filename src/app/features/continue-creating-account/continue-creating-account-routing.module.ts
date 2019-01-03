import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContinueCreatingAccountComponent } from './continue-creating-account.component';

const routes: Routes = [
  {
    path: 'default',
    component: ContinueCreatingAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContinueCreatingAccountRoutingModule { }
