import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectMainServiceComponent } from './select-main-service.component';

const routes: Routes = [
  {
    path: 'default',
    component: SelectMainServiceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectMainServiceRoutingModule { }
