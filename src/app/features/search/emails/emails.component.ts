import { DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TotalEmailsResponse } from '@core/model/emails.model';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { ReportService } from '@core/services/report.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  SendEmailsConfirmationDialogComponent,
} from './dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
})
export class EmailsComponent implements OnDestroy {
  public inactiveWorkplaces = this.route.snapshot.data.inactiveWorkplaces.inactiveWorkplaces;
  public totalEmails = 0;
  public emailGroup = '';
  public selectedTemplateId = '';
  public templates = this.route.snapshot.data.emailTemplates.templates;
  public history = this.route.snapshot.data.emailCampaignHistory;
  public isAdmin: boolean;
  public now: Date = new Date();
  private subscriptions: Subscription = new Subscription();

  constructor(
    public alertService: AlertService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private emailCampaignService: EmailCampaignService,
    private decimalPipe: DecimalPipe,
    private reportsService: ReportService,
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

  public confirmSendEmails(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.dialogService
        .open(SendEmailsConfirmationDialogComponent, { inactiveWorkplaces: this.inactiveWorkplaces })
        .afterClosed.subscribe((hasConfirmed) => {
          if (hasConfirmed) {
            this.sendEmails();
          }
        }),
    );
  }

  private sendEmails(): void {
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

  public downloadReport(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.emailCampaignService.getInactiveWorkplacesReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public downloadRegistrationSurveyReport(event: Event): void {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getRegistrationSurveyReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public downloadSatisfactionSurveyReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getSatisfactionSurveyReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
  }

  public downloadLocalAuthorityAdminReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(
      this.reportsService.getLocalAuthorityAdminReport().subscribe((response) => this.saveFile(response)),
    );
  }

  public downloadDeleteReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(this.reportsService.getDeleteReport().subscribe((response) => this.saveFile(response)));
  }

  public downloadWdfSummaryReport(event: Event) {
    event.preventDefault();
    this.subscriptions.add(this.reportsService.getWdfSummaryReport().subscribe((response) => this.saveFile(response)));
  }

  public saveFile(response: HttpResponse<Blob>) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const header = response.headers.get('content-disposition');
    const filenameMatches = header && header.match(filenameRegEx);
    const filename = filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
    const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, filename);
  }
}
