import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-send-emails-confirmation-dialog',
  templateUrl: './send-emails-confirmation-dialog.component.html',
})
export class SendEmailsConfirmationDialogComponent extends DialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { inactiveWorkplaces: number },
    public dialog: Dialog<SendEmailsConfirmationDialogComponent>,
  ) {
    super(data, dialog);
  }
  public inactiveWorkplaces = 1;

  public close(hasConfirmed: boolean) {
    this.dialog.close(hasConfirmed);
  }
}
