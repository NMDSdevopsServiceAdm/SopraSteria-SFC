import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLaResolver } from '@core/resolvers/admin/local-authorities-return/get-la.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';
import { GetRegistrationsResolver } from '@core/resolvers/admin/registration-requests/get-registrations.resolver';
import { GetRegistrationNotesResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-registration-notes.resolver';
import { GetSingleRegistrationResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-single-registration.resolver';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { SharedModule } from '@shared/shared.module';

import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing.module';
import { ApprovalOrRejectionDialogComponent } from './approval-or-rejection-dialog/approval-or-rejection-dialog.component';
import { CqcIndividualMainServiceChangeComponent } from './cqc-main-service-change/cqc-individual-main-service-change/cqc-individual-main-service-change.component';
import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { LocalAuthorityComponent } from './local-authorities-return/monitor/local-authority/local-authority.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { PendingRegistrationRequestsComponent } from './registration-requests/pending-registration-requests/pending-registration-requests.component';
import { RegistrationRequestComponent } from './registration-requests/registration-request/registration-request.component';
import { RegistrationRequestsComponent } from './registration-requests/registration-requests.component';
import { RejectedRegistrationRequestComponent } from './registration-requests/rejected-registration-request/rejected-registration-request.component';
import { RejectedRegistrationRequestsComponent } from './registration-requests/rejected-registration-requests/rejected-registration-requests.component';
import { ReportComponent } from './report/admin-report.component';
import { SearchForGroupComponent } from './search/search-for-group/search-for-group.component';
import { SearchForUserComponent } from './search/search-for-user/search-for-user.component';
import { SearchForWorkplaceComponent } from './search/search-for-workplace/search-for-workplace.component';
import { SearchComponent } from './search/search.component';
import { WorkplaceDropdownComponent } from './search/workplace-dropdown/workplace-dropdown.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, AdminRoutingModule, RouterModule],
  declarations: [
    AdminMenuComponent,
    LocalAuthoritiesReturnComponent,
    AdminComponent,
    SearchComponent,
    SearchForWorkplaceComponent,
    SearchForUserComponent,
    SearchForGroupComponent,
    SetDatesComponent,
    MonitorComponent,
    LocalAuthorityComponent,
    RegistrationRequestComponent,
    RegistrationRequestsComponent,
    PendingRegistrationRequestsComponent,
    RejectedRegistrationRequestsComponent,
    RejectedRegistrationRequestComponent,
    ReportComponent,
    WorkplaceDropdownComponent,
    CqcIndividualMainServiceChangeComponent,
    ApprovalOrRejectionDialogComponent,
  ],
  providers: [
    LocalAuthoritiesReturnService,
    GetDatesResolver,
    GetLasResolver,
    GetLaResolver,
    GetRegistrationsResolver,
    GetSingleRegistrationResolver,
    GetRegistrationNotesResolver,
    DatePipe,
  ],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
