import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { PasswordResetService } from '@core/services/password-reset.service';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';

@Component({
  selector: 'app-rp-edit',
  templateUrl: './edit.component.html',
})
export class ResetPasswordEditComponent implements OnInit, OnDestroy {
  public resetPasswordForm: FormGroup;
  @Input() validatePasswordResetResponse;
  @Input() headerToken: string;
  public name: string;
  public displayError: boolean;
  public errorDetails: Array<ErrorDetails>;
  private componentAlive = true;

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

    this.displayError = false;
    this.setupErrorDetails();
  }

  public setupErrorDetails(): void {
    this.errorDetails = [
      {
        formControlName: 'createPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your Password.',
          },
          {
            name: 'pattern',
            message: 'Invalid Password.',
          }
        ]
      },
      {
        formControlName: 'confirmPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please confirm your Password.',
          },
          {
            name: 'notMatched',
            message: 'Confirm Password does not match.',
          }
        ]
      }
    ];
  }

  onSubmit() {
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.resetPasswordForm.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      this.displayError = true;
    } else {
      const newPassword = this.getPasswordInput.value;

      this._passwordResetService.resetPassword(newPassword, this.headerToken)
        .pipe(takeWhile(() => this.componentAlive))
        .subscribe(res => {
          this.resetPasswordOutput.emit(res);
        });
    }
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.componentAlive = false;
  }

}
