import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PASSWORD_PATTERN } from '@core/constants/constants';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PasswordResetService } from '@core/services/password-reset.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rp-edit',
  templateUrl: './edit.component.html',
})
export class ResetPasswordEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  @Input() validatePasswordResetResponse;
  @Input() headerToken: string;
  public submitted: boolean;
  public formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  @Output() resetPasswordOutput = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  // Get create password
  get getPasswordInput(): AbstractControl {
    return this.form.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput(): AbstractControl {
    return this.form.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      passwordGroup: this.fb.group(
        {
          createPasswordInput: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues },
      ),
    });

    this.submitted = false;
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'passwordGroup.createPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Enter a password',
          },
          {
            name: 'pattern',
            message:
              'Password must be at least 8 characters long and have uppercase letters, lowercase letters, numbers and special characters like !, £',
          },
        ],
      },
      {
        item: 'passwordGroup.confirmPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please confirm your password',
          },
          {
            name: 'notMatched',
            message: 'Confirmation password does not match the password you entered',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'Database error',
      },
    ];
  }

  public onSubmit(): void {
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      this.submitted = true;
    } else {
      const newPassword = this.getPasswordInput.value;

      this.subscriptions.add(
        this.passwordResetService.resetPassword(newPassword, this.headerToken).subscribe(
          (res) => {
            this.resetPasswordOutput.emit(res);
          },
          (error: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
      );
    }
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

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
