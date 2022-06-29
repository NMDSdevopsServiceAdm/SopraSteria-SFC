import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GetAdminUsersResolver } from '@core/resolvers/admin/admin-users/get-admin-users.resolver';
import { GetCQCStatusChangeResolver } from '@core/resolvers/admin/cqc-main-service-change/get-cqc-main-service-change-list.resolver';
import { GetIndividualCqcMainServiceChangeResolver } from '@core/resolvers/admin/cqc-main-service-change/get-individual-cqc-main-service-change.resolver';
import { EmailCampaignHistoryResolver } from '@core/resolvers/admin/email-campaign-history.resolver';
import { EmailTemplateResolver } from '@core/resolvers/admin/email-template.resolver';
import { InactiveWorkplacesForDeletionResolver } from '@core/resolvers/admin/inactive-workplaces-for-deletion.resolver';
import { InactiveWorkplacesResolver } from '@core/resolvers/admin/inactive-workplaces.resolver';
import { GetDatesResolver } from '@core/resolvers/admin/local-authorities-return/get-dates.resolver';
import { GetLaResolver } from '@core/resolvers/admin/local-authorities-return/get-la.resolver';
import { GetLasResolver } from '@core/resolvers/admin/local-authorities-return/get-las.resolver';
import { GetIndividualParentRequestResolver } from '@core/resolvers/admin/parent-requests-list/get-parent-individual-request.resolver';
import { ParentRequestsListResolver } from '@core/resolvers/admin/parent-requests-list/parent-requests-list.resolver';
import { GetRegistrationsResolver } from '@core/resolvers/admin/registration-requests/get-registrations.resolver';
import { GetRegistrationNotesResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-registration-notes.resolver';
import { GetSingleRegistrationResolver } from '@core/resolvers/admin/registration-requests/single-registration/get-single-registration.resolver';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { SharedModule } from '@shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing.module';
import { ApprovalOrRejectionDialogComponent } from './components/approval-or-rejection-dialog/approval-or-rejection-dialog.component';
import { ApprovalsTableComponent } from './components/approvals-table/approvals-table.component';
import { CqcIndividualMainServiceChangeComponent } from './cqc-main-service-change/cqc-individual-main-service-change/cqc-individual-main-service-change.component';
import { CQCMainServiceChangeListComponent } from './cqc-main-service-change/cqc-main-service-change-list.component';
import { DragAndDropUploadComponent } from './emails/drag-and-drop-upload/drag-and-drop-upload.component';
import { EmailsComponent } from './emails/emails.component';
import { InactiveEmailsComponent } from './emails/inactive-emails/inactive-emails.component';
import { TargetedEmailsComponent } from './emails/targeted-emails/targeted-emails.component';
import { LocalAuthoritiesReturnComponent } from './local-authorities-return/local-authorities-return.component';
import { LocalAuthorityComponent } from './local-authorities-return/monitor/local-authority/local-authority.component';
import { MonitorComponent } from './local-authorities-return/monitor/monitor.component';
import { SetDatesComponent } from './local-authorities-return/set-dates/set-dates.component';
import { ParentRequestIndividualComponent } from './parent-requests/parent-request-individual/parent-request-individual.component';
import { ParentRequestsListComponent } from './parent-requests/parent-requests-list.component';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    OverlayModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    NgxDropzoneModule,
  ],
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
    EmailsComponent,
    TargetedEmailsComponent,
    ApprovalsTableComponent,
    ParentRequestIndividualComponent,
    InactiveEmailsComponent,
    CQCMainServiceChangeListComponent,
    ParentRequestsListComponent,
    DragAndDropUploadComponent,
    AdminUsersComponent,
  ],
  providers: [
    LocalAuthoritiesReturnService,
    GetDatesResolver,
    GetLasResolver,
    GetLaResolver,
    GetRegistrationsResolver,
    GetSingleRegistrationResolver,
    GetRegistrationNotesResolver,
    GetIndividualCqcMainServiceChangeResolver,
    GetCQCStatusChangeResolver,
    DatePipe,
    EmailCampaignService,
    DecimalPipe,
    InactiveWorkplacesResolver,
    EmailTemplateResolver,
    ParentRequestsListResolver,
    EmailCampaignHistoryResolver,
    GetIndividualParentRequestResolver,
    InactiveWorkplacesForDeletionResolver,
    DragAndDropUploadComponent,
    GetAdminUsersResolver,
  ],
  bootstrap: [AdminComponent],
})
export class AdminModule {}
