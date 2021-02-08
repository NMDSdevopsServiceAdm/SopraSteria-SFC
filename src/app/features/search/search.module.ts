import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '@core/services/dialog.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { FirstErrorPipe } from '@shared/pipes/first-error.pipe';
import { SharedModule } from '@shared/shared.module';

import { CqcStatusChangeComponent } from './cqc-status-change/cqc-status-change.component';
import { CqcStatusChangesComponent } from './cqc-status-changes/cqc-status-changes.component';
import { EmailsComponent } from './emails/emails.component';
import { ParentRequestComponent } from './parent-request/parent-request.component';
import { ParentRequestsComponent } from './parent-requests/parent-requests.component';
import { RegistrationComponent } from './registration/registration.component';
import { RegistrationsComponent } from './registrations/registrations.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SendEmailsConfirmationDialogComponent } from './emails/dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    ReactiveFormsModule,
    SharedModule,
    SearchRoutingModule,
    FormsModule
  ],
  providers: [DialogService],
  declarations: [
    SearchComponent,
    AdminUnlockConfirmationDialogComponent,
    FirstErrorPipe,
    RegistrationComponent,
    RegistrationsComponent,
    ParentRequestComponent,
    ParentRequestsComponent,
    CqcStatusChangeComponent,
    CqcStatusChangesComponent,
    EmailsComponent,
    SendEmailsConfirmationDialogComponent,
  ],
})
export class SearchModule { }
