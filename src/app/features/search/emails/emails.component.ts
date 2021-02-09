import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '@core/services/dialog.service';

import {
  SendEmailsConfirmationDialogComponent,
} from './dialogs/send-emails-confirmation-dialog/send-emails-confirmation-dialog.component';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
})
export class EmailsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private dialogService: DialogService) {}

  public history = this.route.snapshot.data.emailCampaignHistory;

  ngOnInit(): void {}

  public confirmSendEmails(event: Event): void {
    event.preventDefault();

    this.dialogService.open(SendEmailsConfirmationDialogComponent, {}).afterClosed.subscribe((hasConfirmed) => {
      if (hasConfirmed) {
      }
    });
  }
}
