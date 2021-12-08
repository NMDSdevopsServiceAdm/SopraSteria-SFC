import { Component, Inject } from '@angular/core';
import { DialogComponent } from '@core/components/dialog.component';
import { ApprovalOrRejectionConfirmation } from '@core/model/admin/approval-or-rejection.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';

@Component({
  selector: 'app-approval-or-rejection-dialog',
  templateUrl: './approval-or-rejection-dialog.component.html',
})
export class ApprovalOrRejectionDialogComponent extends DialogComponent {
  public isApproval: boolean;
  public workplaceName: string;
  public approvalName: string;
  public approvalType: string;

  constructor(
    @Inject(DIALOG_DATA) public data: ApprovalOrRejectionConfirmation,
    public dialog: Dialog<ApprovalOrRejectionDialogComponent>,
  ) {
    super(data, dialog);

    this.isApproval = data.isApproval;
    this.workplaceName = data.workplaceName;
    this.approvalName = data.approvalName;
    this.approvalType = data.approvalType;
  }

  public closeDialogWindow(event: Event, approvalOrRejectionConfirmed: boolean): void {
    event.preventDefault();
    this.dialog.close(approvalOrRejectionConfirmed);
  }
}
