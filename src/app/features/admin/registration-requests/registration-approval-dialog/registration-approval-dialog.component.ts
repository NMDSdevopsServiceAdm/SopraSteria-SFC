import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-registration-approval-dialog',
  templateUrl: './registration-approval-dialog.component.html',
})
export class RegistrationApprovalDialogComponent extends DialogComponent {
  constructor(@Inject(DIALOG_DATA) public data, public dialog: Dialog<RegistrationApprovalDialogComponent>) {
    super(data, dialog);
  }

  public closeDialogWindow(event: Event, approvalConfirmed: boolean): void {
    event.preventDefault();
    this.dialog.close(approvalConfirmed);
  }
}
