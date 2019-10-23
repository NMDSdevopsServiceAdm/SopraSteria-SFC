import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { RejectOptions } from '@core/model/my-workplaces.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

const OWNERSHIP_REJECTED = 'OWNERCHANGEREJECTED';

@Component({
  selector: 'app-reject-request-dialog',
  templateUrl: './reject-request-dialog.component.html',
})
export class RejectRequestDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  protected subscriptions: Subscription = new Subscription();
  public rejectOptions;
  public displayReason: boolean;
  public reasonCharacterLimit = 500;
  private serverErrorsMap: Array<ErrorDefinition>;
  public reason = '';
  public notification: Notification;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder,
    public dialog: Dialog<RejectRequestDialogComponent>,
    private notificationsService: NotificationsService
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.notification = this.data;
    this.setRejectOptions();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  private setRejectOptions(): void {
    this.rejectOptions = RejectOptions;
    this.displayReason = false;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      rejectOption: [null],
      reason: [null],
    });
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      this.rejectPermissionRequest();
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'reason',
        type: [
          {
            name: 'required',
            message: 'Please provide reason.',
          },
          {
            name: 'maxlength',
            message: `Character limit of ${this.reasonCharacterLimit} exceeded.`,
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not submit your reason for rejecting. You can try again or contact us',
      },
      {
        name: 400,
        message: 'Unable to update notification.',
      },
    ];
  }

  public handleChange(evt) {
    const group = this.form as FormGroup;
    const { rejectOption, reason } = group.controls;
    reason.clearValidators();
    reason.setValue('');
    if (this.form.value.rejectOption === 'YES') {
      this.displayReason = true;
      reason.setValidators([Validators.required, Validators.maxLength(this.reasonCharacterLimit)]);
    } else {
      this.displayReason = false;
    }
    reason.updateValueAndValidity();
  }

  public rejectPermissionRequest() {
    let requestParameter = {
      ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
      approvalStatus: 'REJECT',
      approvalReason: this.form.value.reason,
      type: OWNERSHIP_REJECTED,
    };
    this.subscriptions.add(
      this.notificationsService
        .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
        .subscribe(
          request => {
            if (request) {
              this.close(true);
            }
          },
          error => {
            console.error(error.error.message);
          }
        )
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
