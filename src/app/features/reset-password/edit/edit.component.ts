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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  get getPasswordInput() {
    return this.form.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.form.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.form = this.fb.group({
      passwordGroup: this.fb.group(
        {
          createPasswordInput: [
            '',
            [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}')],
          ],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues },
      ),
    });

    this.submitted = false;
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
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
          },
        ],
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
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Database error.',
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
