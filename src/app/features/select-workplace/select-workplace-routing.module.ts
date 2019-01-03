import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectWorkplaceComponent } from './select-workplace.component';

const routes: Routes = [
  {
    path: 'default',
    component: SelectWorkplaceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectWorkplaceRoutingModule { }
