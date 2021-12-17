import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmailCampaignHistoryResolver } from '@core/resolvers/admin/email-campaign-history.resolver';
import { EmailTemplateResolver } from '@core/resolvers/admin/email-template.resolver';
import { InactiveWorkplacesResolver } from '@core/resolvers/admin/inactive-workplaces.resolver';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { DialogService } from '@core/services/dialog.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/admin-unlock-confirmation/admin-unlock-confirmation';
import { SharedModule } from '@shared/shared.module';

import { CqcStatusChangeComponent } from './cqc-status-change/cqc-status-change.component';
import { CqcStatusChangesComponent } from './cqc-status-changes/cqc-status-changes.component';
import {
  SendEmailsConfirmationDialogComponent,
} from './emails/dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';
import { EmailsComponent } from './emails/emails.component';
import { ParentRequestComponent } from './parent-request/parent-request.component';
import { ParentRequestsComponent } from './parent-requests/parent-requests.component';
import { RegistrationComponent } from './registration/registration.component';
import { RegistrationsComponent } from './registrations/registrations.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

@NgModule({
  imports: [CommonModule, OverlayModule, ReactiveFormsModule, SharedModule, SearchRoutingModule, FormsModule],
  providers: [
    DialogService,
    EmailCampaignHistoryResolver,
    InactiveWorkplacesResolver,
    EmailCampaignService,
    DecimalPipe,
    EmailTemplateResolver,
  ],
  declarations: [
    SearchComponent,
    AdminUnlockConfirmationDialogComponent,
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
export class SearchModule {}
