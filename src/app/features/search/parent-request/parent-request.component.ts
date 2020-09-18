import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { DialogService } from '@core/services/dialog.service';
import { ParentConfirmationDialogComponent } from '@features/search/parent-request/parent-confirmation-dialog.component';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-parent-request',
  templateUrl: './parent-request.component.html',
})
export class ParentRequestComponent implements OnInit {
  @Output() removeParentRequest: EventEmitter<any> = new EventEmitter<any>();
  @Input() index: number;
  @Input() parentRequest: any;
  public parentRequestForm: FormGroup;
  public approve: boolean;
  public rejectionReason: string;

  constructor(
    public parentRequestsService: ParentRequestsService,
    public switchWorkplaceService: SwitchWorkplaceService,
    public dialogService: DialogService,
    public alertService: AlertService,
  ) {}
  ngOnInit() {
    this.parentRequestForm = new FormGroup({});
  }

  get establishmentId() {
    return this.parentRequest.establishmentId;
  }

  public approveParentRequest(approve: boolean, rejectionReason: string) {
    this.approve = approve;
    this.rejectionReason = rejectionReason;

    event.preventDefault();

    this.dialogService
      .open(ParentConfirmationDialogComponent, {
        orgName: this.parentRequest.orgName,
        headingText: approve ? "You're about to approve this request." : "You're about to reject this request.",
        paragraphText: approve
          ? `If you do this, ${this.parentRequest.orgName} will become a parent workplace.`
          : `If you do this, ${this.parentRequest.orgName} will not become a parent workplace.`,
        buttonText: approve ? 'Approve request' : 'Reject request',
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
      parentRequestId: this.parentRequest.requestId,
      establishmentId: this.parentRequest.establishmentId,
      userId: this.parentRequest.userId,
      rejectionReason: this.rejectionReason,
      approve: this.approve,
    };

    this.parentRequestsService.parentApproval(data).subscribe(
      () => {
        this.removeParentRequest.emit(this.index);
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
      message: `Parent request ${approvedOrRejected} for ${this.parentRequest.orgName}.`,
    });
  }

  private populateErrorFromServer(err) {
    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.parentRequestForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }
}
