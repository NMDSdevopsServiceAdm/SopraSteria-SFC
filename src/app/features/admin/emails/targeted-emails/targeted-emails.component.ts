import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailType, TotalEmailsResponse } from '@core/model/emails.model';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SendEmailsConfirmationDialogComponent } from '../dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './targeted-emails.component.html',
})
export class TargetedEmailsComponent {
  public totalEmails = 0;
  public emailGroup = '';
  public selectedTemplateId = '';
  public templates = this.route.snapshot.data.emailTemplates.templates;
  public isAdmin: boolean;
  public now: Date = new Date();
  private subscriptions: Subscription = new Subscription();
  public emailType = EmailType;
  inactiveWorkplaces: any;
  history: any;
  constructor(
    public alertService: AlertService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private emailCampaignService: EmailCampaignService,
    private decimalPipe: DecimalPipe,
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  public updateTotalEmails(groupType: string): void {
    if (groupType) {
      this.subscriptions.add(
        this.emailCampaignService
          .getTargetedTotalEmails(groupType)
          .subscribe((totalEmails: TotalEmailsResponse) => (this.totalEmails = totalEmails.totalEmails)),
      );
    } else {
      this.totalEmails = 0;
    }
  }
  public confirmSendEmails(event: Event, emailCount: number, type: EmailType): void {
    event.preventDefault();
    this.subscriptions.add(
      this.dialogService
        .open(SendEmailsConfirmationDialogComponent, { emailCount })
        .afterClosed.subscribe((hasConfirmed) => {
          if (hasConfirmed) {
            this.sendEmails(type);
          }
        }),
    );
  }
  private sendEmails(type: EmailType): void {
    switch (type) {
      case EmailType.InactiveWorkplaces:
        this.sendInactiveEmails();
        break;
      case EmailType.TargetedEmails:
        this.sendTargetedEmails();
        break;
    }
  }
  private sendInactiveEmails(): void {
    this.subscriptions.add(
      this.emailCampaignService
        .createInactiveWorkplacesCampaign()
        .pipe(
          switchMap((latestCampaign) => {
            return this.emailCampaignService.getInactiveWorkplaces().pipe(
              map(({ inactiveWorkplaces }) => ({
                latestCampaign,
                inactiveWorkplaces,
              })),
            );
          }),
        )
        .subscribe(({ latestCampaign, inactiveWorkplaces }) => {
          this.history.unshift(latestCampaign);
          this.alertService.addAlert({
            type: 'success',
            message: `${this.decimalPipe.transform(latestCampaign.emails)} ${
              latestCampaign.emails > 1 ? 'emails have' : 'email has'
            } been scheduled to be sent.`,
          });
          this.inactiveWorkplaces = inactiveWorkplaces;
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
}
