import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { PasswordResetService } from '@core/services/password-reset.service';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rp-edit',
  templateUrl: './edit.component.html',
})
export class ResetPasswordEditComponent implements OnInit, OnDestroy {
  public resetPasswordForm: FormGroup;
  @Input() validatePasswordResetResponse;
  @Input() headerToken: string;
  public name: string;
  public submitted: boolean;
  public errorDetails: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();

  @Output() resetPasswordOutput = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private _passwordResetService: PasswordResetService,
    private errorSummaryService: ErrorSummaryService,
  ) { }

  // Get password group
  get getPasswordGroup() {
    return this.resetPasswordForm.get('passwordGroup');
  }

  // Get create password
  get getPasswordInput() {
    return this.resetPasswordForm.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.resetPasswordForm.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      passwordGroup: this.fb.group(
        {
          createPasswordInput: [
            '',
            [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}')],
          ],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues }
      )
    });

    if (this.validatePasswordResetResponse && this.validatePasswordResetResponse.body) {
      this.name = this.validatePasswordResetResponse.body.username;
    }

    this.submitted = false;
    this.setupErrorDetails();
  }

  public setupErrorDetails(): void {
    this.errorDetails = [
      {
        item: 'createPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your password.',
          },
          {
            name: 'pattern',
            message: 'Invalid password.',
          }
        ]
      },
      {
        item: 'confirmPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please confirm your password.',
          },
          {
            name: 'notMatched',
            message: 'Confirm password does not match.',
          }
        ]
      }
    ];
  }

  onSubmit() {
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.resetPasswordForm.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      this.submitted = true;
    } else {
      const newPassword = this.getPasswordInput.value;

      this.subscriptions.add(
        this._passwordResetService.resetPassword(newPassword, this.headerToken)
          .subscribe(res => {
            this.resetPasswordOutput.emit(res);
          })
      );
    }
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
