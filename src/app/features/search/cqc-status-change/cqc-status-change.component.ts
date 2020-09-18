import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { ApprovalRequest } from '@core/model/approval-request.model';
import { DialogService } from '@core/services/dialog.service';
import { CqcConfirmationDialogComponent } from '@features/search/cqc-status-change/cqc-confirmation-dialog.component';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-cqc-status-change',
  templateUrl: './cqc-status-change.component.html',
})
export class CqcStatusChangeComponent implements OnInit {
  @Output() removeCqcStatusChanges: EventEmitter<any> = new EventEmitter<any>();
  @Input() index: number;
  @Input() cqcStatusChange: any;
  public cqcStatusChangeForm: FormGroup;
  public approve: boolean;
  public rejectionReason: string;

  constructor(
    public cqcStatusChangeService: CqcStatusChangeService,
    public switchWorkplaceService: SwitchWorkplaceService,
    public dialogService: DialogService,
    public alertService: AlertService,
  ) {}
  ngOnInit() {
    this.cqcStatusChangeForm = new FormGroup({});
  }

  get establishmentId() {
    return this.cqcStatusChange.establishmentId;
  }

  public approveCQCRequest(approve: boolean, rejectionReason: string) {
    this.approve = approve;
    this.rejectionReason = rejectionReason;

    event.preventDefault();

    this.dialogService
      .open(CqcConfirmationDialogComponent, {
        orgName: this.cqcStatusChange.orgName,
        headingText: approve ? "You're about to approve this request." : "You're about to reject this request.",
        paragraphText: approve
          ? `If you do this, ${this.cqcStatusChange.orgName} will be flagged as CQC regulated and their new main service will be ${this.cqcStatusChange.data.requestedService.name}.`
          : `If you do this, ${this.cqcStatusChange.orgName} will not be flagged as CQC regulated and their main service will still be ${this.cqcStatusChange.data.currentService.name}.`,
        buttonText: approve ? 'Approve this change' : 'Reject this change',
      })
      .afterClosed.subscribe((approveConfirmed) => {
        if (approveConfirmed) {
          this.approveOrRejectRequest();
        }
      });
  }

  public navigateToWorkplace(id, username, nmdsId, e): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public onSubmit() {
    // Nothing to do here - it's all done via the confirmation dialog.
  }

  private approveOrRejectRequest() {
    let data;
    data = {
      approvalId: this.cqcStatusChange.requestId,
      establishmentId: this.cqcStatusChange.establishmentId,
      userId: this.cqcStatusChange.userId,
      rejectionReason: this.rejectionReason,
      approve: this.approve,
    };

    this.cqcStatusChangeService.CqcStatusChangeApproval(data).subscribe(
      () => {
        this.removeCqcStatusChanges.emit(this.index);
        this.showConfirmationMessage();
      },
      (err) => {
        if (err instanceof HttpErrorResponse) {
          this.populateErrorFromServer(err);
        }
      },
    );
  }

  private showConfirmationMessage() {
    const approvedOrRejected = this.approve ? 'approved' : 'rejected';

    this.alertService.addAlert({
      type: 'success',
      message: `You've ${approvedOrRejected} the main service change for ${this.cqcStatusChange.orgName}.`,
    });
  }

  private populateErrorFromServer(err) {
    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.cqcStatusChangeForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }
}
