import { DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SendEmailsConfirmationDialogComponent } from './dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
})
export class EmailsComponent implements OnInit {
  public inactiveWorkplaces = this.route.snapshot.data.inactiveWorkplaces.inactiveWorkplaces;
  public history = this.route.snapshot.data.emailCampaignHistory;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public alertService: AlertService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private emailCampaignService: EmailCampaignService,
    private decimalPipe: DecimalPipe,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
        .createCampaign()
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
            message: `${this.decimalPipe.transform(latestCampaign.emails)} emails sent successfully.`,
          });

          this.inactiveWorkplaces = inactiveWorkplaces;
        }),
    );
  }

  public downloadReport(event: Event): void {
    event.preventDefault();

    this.subscriptions.add(
      this.emailCampaignService.getReport().subscribe((response) => {
        this.saveFile(response);
      }),
    );
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
