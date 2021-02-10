import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
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
    private router: Router,
    private dialogService: DialogService,
    private emailCampaignService: EmailCampaignService,
  ) {}

  public inactiveWorkplaces = 5673;
  public history = this.route.snapshot.data.emailCampaignHistory;

  ngOnInit(): void {}

  public confirmSendEmails(event: Event): void {
    event.preventDefault();

    this.dialogService.open(SendEmailsConfirmationDialogComponent, {}).afterClosed.subscribe((hasConfirmed) => {
      if (hasConfirmed) {
        this.sendEmails();
      }
    });
  }

  private sendEmails(): void {
    this.emailCampaignService.createCampaign().subscribe((latestCampaign) => {
      this.history.unshift(latestCampaign);
      this.inactiveWorkplaces = 0;
    });
  }
}
