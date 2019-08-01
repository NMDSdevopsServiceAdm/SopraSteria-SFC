import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWorkplaceInProgressGuard } from '@core/guards/add-workplace-in-progress/add-workplace-in-progress.guard';
import { AddWorkplaceCompleteComponent } from '@features/add-workplace/add-workplace-complete/add-workplace-complete.component';
import { ChangeYourDetailsComponent } from '@features/add-workplace/change-your-details/change-your-details.component';
import { ConfirmAccountDetailsComponent } from '@features/add-workplace/confirm-account-details/confirm-account-details.component';
import { ConfirmWorkplaceDetailsComponent } from '@features/add-workplace/confirm-workplace-details/confirm-workplace-details.component';
import { CreateUserAccountComponent } from '@features/add-workplace/create-user-account/create-user-account.component';
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
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    data: { title: 'Select Workplace' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    data: { title: 'Select Workplace Address' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'enter-workplace-address',
    component: EnterWorkplaceAddressComponent,
    data: { title: 'Enter Workplace Address' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'find-workplace-address',
    component: FindWorkplaceAddressComponent,
    data: { title: 'Find Workplace Address' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent,
    data: { title: 'Confirm Workplace Details' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'create-user-account',
    component: CreateUserAccountComponent,
    data: { title: 'Create User Account' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    data: { title: 'Change Your Details' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    data: { title: 'Confirm Account Details' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    data: { title: 'Select Main Service' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
  {
    path: 'complete',
    component: AddWorkplaceCompleteComponent,
    data: { title: 'Complete' },
    canActivate: [AddWorkplaceInProgressGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkplaceRoutingModule {}
