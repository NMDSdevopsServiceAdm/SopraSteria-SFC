import { DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailType, TotalEmailsResponse } from '@core/model/emails.model';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import saveAs from 'file-saver';
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
  public nmdsIdsFileData: FormData | null = null;

  constructor(
    public alertService: AlertService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private emailCampaignService: EmailCampaignService,
    private decimalPipe: DecimalPipe,
  ) {}

  public updateTotalEmails(groupType: string): void {
    const isMultipleAccounts = groupType === 'multipleAccounts';
    this.showDragAndDrop = isMultipleAccounts;

    if (isMultipleAccounts) {
      this.totalEmails = 0;
    } else if (groupType) {
      this.nmdsIdsFileData = null;
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
      this.emailCampaignService
        .createTargetedEmailsCampaign(this.emailGroup, this.selectedTemplateId, this.nmdsIdsFileData)
        .subscribe(() => {
          this.alertService.addAlert({
            type: 'success',
            message: `${this.decimalPipe.transform(this.totalEmails)} ${
              this.totalEmails > 1 ? 'emails have' : 'email has'
            } been scheduled to be sent.`,
          });
          this.emailGroup = '';
          this.selectedTemplateId = '';
          this.totalEmails = 0;
          this.showDragAndDrop = false;
          this.nmdsIdsFileData = null;
        }),
    );
  }

  public downloadTargetedEmailsReport(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.emailCampaignService
        .getTargetedEmailsReport(this.nmdsIdsFileData)
        .subscribe((response) => this.saveFile(response)),
    );
  }

  public validateFile(file: File): void {
    this.nmdsIdsFileData = new FormData();
    this.nmdsIdsFileData.append('targetedRecipientsFile', file, file.name);
    this.emailCampaignService
      .getTargetedTotalValidEmails(this.nmdsIdsFileData)
      .subscribe((res: TotalEmailsResponse) => (this.totalEmails = res.totalEmails));
  }

  public saveFile(response: HttpResponse<Blob>): void {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, filename);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
