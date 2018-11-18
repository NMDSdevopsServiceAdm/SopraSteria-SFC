import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectWorkplaceAddressComponent } from './select-workplace-address.component';

const routes: Routes = [
  {
    path: 'default',
    component: SelectWorkplaceAddressComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectWorkplaceAddressRoutingModule { }
