import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { RegistrationApprovalOrRejectionConfirmation } from '@core/model/registrations.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-registration-approval-or-rejection-dialog',
  templateUrl: './registration-approval-or-rejection-dialog.component.html',
})
export class RegistrationApprovalOrRejectionDialogComponent extends DialogComponent {
  public isApproval: boolean;
  public workplaceName: string;

  constructor(
    @Inject(DIALOG_DATA) public data: RegistrationApprovalOrRejectionConfirmation,
    public dialog: Dialog<RegistrationApprovalOrRejectionDialogComponent>,
  ) {
    super(data, dialog);

    this.isApproval = data.isApproval;
    this.workplaceName = data.workplaceName;
  }

  public closeDialogWindow(event: Event, approvalOrRejectionConfirmed: boolean): void {
    event.preventDefault();
    this.dialog.close(approvalOrRejectionConfirmed);
  }
}
