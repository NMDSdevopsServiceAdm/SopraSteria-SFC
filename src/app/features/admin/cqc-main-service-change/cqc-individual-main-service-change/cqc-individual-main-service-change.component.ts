import { Component } from '@angular/core';
import { Dialog, DialogService } from '@core/services/dialog.service';
import { ApprovalOrRejectionDialogComponent } from '@features/admin/approval-or-rejection-dialog/approval-or-rejection-dialog.component';

@Component({
  selector: 'app-cqc-individual-main-service-change',
  templateUrl: './cqc-individual-main-service-change.component.html',
})
export class CqcIndividualMainServiceChangeComponent {
  constructor(private dialogService: DialogService) {}

  public approveOrRejectCqcChange(isApproval: boolean): void {
    const dialog = this.openApprovalOrRejectionDialog(isApproval);

    dialog.afterClosed.subscribe((confirmed) => {
      if (confirmed) {
        console.log('confirmed');
      }
    });
  }

  private openApprovalOrRejectionDialog(isApproval: boolean): Dialog<ApprovalOrRejectionDialogComponent> {
    return this.dialogService.open(ApprovalOrRejectionDialogComponent, {
      workplaceName: 'Stub Workplace',
      approvalName: 'CQC main service change',
      approvalType: 'change',
      isApproval,
    });
  }
}
