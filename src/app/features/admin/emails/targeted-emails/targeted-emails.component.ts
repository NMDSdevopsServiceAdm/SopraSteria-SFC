import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailType, TotalEmailsResponse } from '@core/model/emails.model';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { Subscription } from 'rxjs';

import { SendEmailsConfirmationDialogComponent } from '../dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-targeted-emails',
  templateUrl: './targeted-emails.component.html',
  styleUrls: ['./targeted-emails.component.scss'],
})
export class TargetedEmailsComponent implements OnDestroy {
  public totalEmails = 0;
  public emailGroup = '';
  public selectedTemplateId = '';
  public templates = this.route.snapshot.data.emailTemplates.templates;
  private subscriptions: Subscription = new Subscription();
  public emailType = EmailType;
  public showDragAndDrop = false;

  constructor(
    public alertService: AlertService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private emailCampaignService: EmailCampaignService,
    private decimalPipe: DecimalPipe,
  ) {}

  public updateTotalEmails(groupType: string): void {
    if (groupType === 'multipleAccounts') {
      this.showDragAndDrop = true;
      this.totalEmails = 0;
    } else if (groupType) {
      this.subscriptions.add(
        this.emailCampaignService
          .getTargetedTotalEmails(groupType)
          .subscribe((totalEmails: TotalEmailsResponse) => (this.totalEmails = totalEmails.totalEmails)),
      );
    } else {
      this.totalEmails = 0;
    }
  }

  public confirmSendEmails(event: Event, emailCount: number): void {
    event.preventDefault();
    this.subscriptions.add(
      this.dialogService
        .open(SendEmailsConfirmationDialogComponent, { emailCount })
        .afterClosed.subscribe((hasConfirmed) => {
          if (hasConfirmed) {
            this.sendTargetedEmails();
          }
        }),
    );
  }
  private sendTargetedEmails(): void {
    this.subscriptions.add(
      this.emailCampaignService.createTargetedEmailsCampaign(this.emailGroup, this.selectedTemplateId).subscribe(() => {
        this.alertService.addAlert({
          type: 'success',
          message: `${this.decimalPipe.transform(this.totalEmails)} ${
            this.totalEmails > 1 ? 'emails have' : 'email has'
          } been scheduled to be sent.`,
        });
        this.emailGroup = '';
        this.selectedTemplateId = '';
        this.totalEmails = 0;
      }),
    );
  }

  public uploadFile(event): void {
    console.log(event);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
