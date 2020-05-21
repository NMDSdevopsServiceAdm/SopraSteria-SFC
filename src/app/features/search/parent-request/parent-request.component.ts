import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { DialogService } from '@core/services/dialog.service';
import { ParentConfirmationDialogComponent } from '@features/search/parent-request/parent-confirmation-dialog.component';

@Component({
  selector: 'app-parent-request',
  templateUrl: './parent-request.component.html'
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
    public dialogService: DialogService,
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
      .open(ParentConfirmationDialogComponent, { })
      .afterClosed.subscribe(approveConfirmed => {
        if(approveConfirmed) {
          this.approveOrRejectRequest();
        }
      });
  }

  public onSubmit() {
    // Nothing to do here - it's all done via the confirmation dialog.
  }

  private approveOrRejectRequest() {
    let data;
    data = {
      establishmentId: this.parentRequest.establishmentId,
      userId: this.parentRequest.userId,
      rejectionReason: this.rejectionReason,
      approve: this.approve,
    };

    this.parentRequestsService.parentApproval(data).subscribe(
      () => {
        this.removeParentRequest.emit(this.index);
      },
      (err) => {
        if (err instanceof HttpErrorResponse) {
          this.populateErrorFromServer(err);
        }
      }
    );
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
