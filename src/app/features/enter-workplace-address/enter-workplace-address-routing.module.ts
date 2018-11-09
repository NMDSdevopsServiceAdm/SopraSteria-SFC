import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnterWorkplaceAddressComponent } from './enter-workplace-address.component';

const routes: Routes = [
  {
    path: 'default',
    component: EnterWorkplaceAddressComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnterWorkplaceAddressRoutingModule { }
