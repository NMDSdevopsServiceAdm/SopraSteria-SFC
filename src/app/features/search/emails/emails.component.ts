import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';

import {
  SendEmailsConfirmationDialogComponent,
} from './dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
})
export class EmailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private emailCampaignService: EmailCampaignService,
    private alertService: AlertService,
    private decimalPipe: DecimalPipe,
  ) {}

  public inactiveWorkplaces = 5673;
  public history = this.route.snapshot.data.emailCampaignHistory;

  ngOnInit(): void {}

  public confirmSendEmails(event: Event): void {
    event.preventDefault();

    this.dialogService
      .open(SendEmailsConfirmationDialogComponent, { inactiveWorkplaces: this.inactiveWorkplaces })
      .afterClosed.subscribe((hasConfirmed) => {
        if (hasConfirmed) {
          this.sendEmails();
        }
      });
  }

  private sendEmails(): void {
    this.emailCampaignService.createCampaign().subscribe((latestCampaign) => {
      this.history.unshift(latestCampaign);

      this.alertService.addAlert({
        type: 'success',
        message: `${this.decimalPipe.transform(latestCampaign.emails)} emails sent successfully.`,
      });

      this.emailCampaignService.getInactiveWorkplaces().subscribe(({ inactiveWorkplaces }) => {
        this.inactiveWorkplaces = inactiveWorkplaces;
      });
    });
  }
}
