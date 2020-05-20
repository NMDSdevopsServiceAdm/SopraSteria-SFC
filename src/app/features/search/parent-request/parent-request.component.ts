import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ParentRequestsService } from '@core/services/parent-requests.service';

@Component({
  selector: 'app-parent-request',
  templateUrl: './parent-request.component.html'
})
export class ParentRequestComponent implements OnInit {
  @Output() handleParentRequest: EventEmitter<any> = new EventEmitter<any>();
  @Input() index: number;
  @Input() parentRequest: any;
  public parentRequestForm: FormGroup;
  public approve: boolean;
  public rejectionReason: string;

  constructor(
    public parentRequestsService: ParentRequestsService,
  ) {}
  ngOnInit() {
    this.parentRequestForm = new FormGroup({
      establishmentId: new FormControl(this.parentRequest.establishment.uid, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
    });
  }

  get establishmentId() {
    return this.parentRequestForm.get('establishmentId');
  }

  public approveParentRequest(approve: boolean, rejectionReason: string) {
    this.approve = approve;
    this.rejectionReason = rejectionReason;
  }
  public onSubmit() {
    if (this.parentRequestForm.valid) {
      let data;
      data = {
        establishmentId: this.parentRequest.establishment.uid,
        userId: this.parentRequest.user.uid,
        approve: this.approve,
        rejectionReason: this.rejectionReason,
      };

      this.parentRequestsService.parentApproval(data).subscribe(
        () => {
          this.handleParentRequest.emit(this.index);
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            this.populateErrorFromServer(err);
          }
        }
      );
    }
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
