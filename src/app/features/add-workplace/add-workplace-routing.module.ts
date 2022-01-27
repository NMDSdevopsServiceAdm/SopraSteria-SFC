import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWorkplaceInProgressGuard } from '@core/guards/add-workplace-in-progress/add-workplace-in-progress.guard';
import {
  AddWorkplaceCompleteComponent,
} from '@features/add-workplace/add-workplace-complete/add-workplace-complete.component';
import { ChangeYourDetailsComponent } from '@features/add-workplace/change-your-details/change-your-details.component';
import {
  ConfirmAccountDetailsComponent,
} from '@features/add-workplace/confirm-account-details/confirm-account-details.component';
import {
  ConfirmWorkplaceDetailsComponent,
} from '@features/add-workplace/confirm-workplace-details/confirm-workplace-details.component';
import { CreateUserAccountComponent } from '@features/add-workplace/create-user-account/create-user-account.component';
import {
  FindWorkplaceAddressComponent,
} from '@features/add-workplace/find-workplace-address/find-workplace-address.component';
import { FindYourWorkplaceComponent } from '@features/add-workplace/find-your-workplace/find-your-workplace.component';
import {
  IsThisYourWorkplaceComponent,
} from '@features/add-workplace/is-this-your-workplace/is-this-your-workplace.component';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectMainServiceComponent } from '@features/add-workplace/select-main-service/select-main-service.component';
import {
  SelectWorkplaceAddressComponent,
} from '@features/add-workplace/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/add-workplace/select-workplace/select-workplace.component';
import {
  WorkplaceNameAddressComponent,
} from '@features/add-workplace/workplace-name-address/workplace-name-address.component';

import { AddTotalStaffComponent } from './add-total-staff/add-total-staff.component';
import {
  CouldNotFindWorkplaceAddressComponent,
} from './could-not-find-workplace-address/could-not-find-workplace-address.component';
import { NameOfWorkplaceComponent } from './name-of-workplace/name-of-workplace.component';
import { StartComponent } from './start/start.component';
import { WorkplaceAddedThankYouComponent } from './workplace-added-thank-you/workplace-added-thank-you.component';
import { WorkplaceNotFoundComponent } from './workplace-not-found/workplace-not-found.component';

const routes: Routes = [
  {
    path: 'start',
    component: StartComponent,
    data: { title: 'Add Workplace' },
  },
  {
    path: 'workplace-not-found',
    component: WorkplaceNotFoundComponent,
    data: { title: 'Could not find your workplace' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    data: { title: 'Select Workplace' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'find-workplace',
    component: FindYourWorkplaceComponent,
    data: { title: 'Find your workplace' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'your-workplace',
    component: IsThisYourWorkplaceComponent,
    data: { title: 'Is this your workplace?' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    data: { title: 'Select Workplace Address' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'find-workplace-address',
    component: FindWorkplaceAddressComponent,
    data: { title: 'Find Workplace Address' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'confirm-workplace-details',
    component: ConfirmWorkplaceDetailsComponent,
    data: { title: 'Confirm Workplace Details' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'create-user-account',
    component: CreateUserAccountComponent,
    data: { title: 'Create User Account' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'change-your-details',
    component: ChangeYourDetailsComponent,
    data: { title: 'Change Your Details' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'confirm-account-details',
    component: ConfirmAccountDetailsComponent,
    data: { title: 'Confirm Account Details' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'select-main-service',
    component: SelectMainServiceComponent,
    data: { title: 'Select Main Service' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'add-total-staff',
    component: AddTotalStaffComponent,
    data: { title: 'Add Total Staff' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'complete',
    component: AddWorkplaceCompleteComponent,
    data: { title: 'Complete' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'thank-you',
    component: WorkplaceAddedThankYouComponent,
    data: { title: 'Thank you' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'regulated-by-cqc',
    component: RegulatedByCqcComponent,
    data: { title: 'Service regulated by CQC?' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'find-workplace',
    component: RegulatedByCqcComponent,
    data: { title: 'Find your workplace' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'workplace-name',
    component: NameOfWorkplaceComponent,
    data: { title: `What's the name of your workplace?` },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'workplace-name-address',
    component: WorkplaceNameAddressComponent,
    data: { title: 'Workplace name and address?' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
  {
    path: 'workplace-address-not-found',
    component: CouldNotFindWorkplaceAddressComponent,
    data: { title: 'Could not find your workplace address' },
    canActivate: [AddWorkplaceInProgressGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkplaceRoutingModule {}
