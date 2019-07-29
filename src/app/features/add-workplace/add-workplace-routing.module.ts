import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnterWorkplaceAddressComponent } from '@features/add-workplace/enter-workplace-address/enter-workplace-address.component';
import { FindWorkplaceAddressComponent } from '@features/add-workplace/find-workplace-address/find-workplace-address.component';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from '@features/add-workplace/select-main-service/select-main-service.component';
import { SelectWorkplaceAddressComponent } from '@features/add-workplace/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/add-workplace/select-workplace/select-workplace.component';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  {
    path: 'start',
    component: StartComponent,
    data: { title: 'Add Workplace' },
  },
  {
    path: 'regulated-by-cqc',
    component: RegulatedByCqcComponent,
    data: { title: 'Regulated by CQC' },
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    data: { title: 'Select Workplace' },
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    data: { title: 'Select Workplace Address' },
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent,
    data: { title: 'Enter Workplace Address' },
  },
  {
    path: 'find-workplace-address',
    component: FindWorkplaceAddressComponent,
    data: { title: 'Find Workplace Address' },
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    data: { title: 'Select Main Service' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkplaceRoutingModule {}
