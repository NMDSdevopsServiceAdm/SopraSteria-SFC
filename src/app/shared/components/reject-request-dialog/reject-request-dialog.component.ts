import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { RejectOptions } from '@core/model/my-workplaces.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

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

  public reason = '';
  public notification;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder,
    public dialog: Dialog<RejectRequestDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.notification = this.data;
    this.setRejectOptions();
    this.setupForm();
    this.setupFormErrorsMap();
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

  close(returnToClose: any) {
    this.dialog.close(returnToClose);
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

  public rejectNotificationRequest() {
    if (this.form.valid) {
      this.close({ rejectionReason: this.form.value.reason });
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
