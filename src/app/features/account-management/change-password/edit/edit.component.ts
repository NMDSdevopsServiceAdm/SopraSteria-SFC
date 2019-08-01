import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { PasswordResetService } from '@core/services/password-reset.service';
import { UserService } from '@core/services/user.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
})
export class ChangePasswordEditComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();
  @Input() public userDetails: UserDetails;
  @Output() public resetPasswordEvent = new EventEmitter();
  public serverErrorsMap: Array<ErrorDefinition>;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public return: URLStructure = { url: ['/account-management'] };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private passwordResetService: PasswordResetService,
    private errorSummaryService: ErrorSummaryService
  ) {}

  // Get old password
  get getOldPasswordInput() {
    return this.form.get('oldPasswordInput');
  }

  // Get create password
  get getCreatePasswordInput() {
    return this.form.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.form.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.form = this.fb.group({
      oldPasswordInput: ['', Validators.required],
      passwordGroup: this.fb.group(
        {
          createPasswordInput: [
            '',
            [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}')],
          ],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues }
      ),
    });

    this.submitted = false;
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'oldPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your old password.',
          },
        ],
      },
      {
        item: 'passwordGroup.createPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your new password.',
          },
          {
            name: 'pattern',
            message: 'Invalid password.',
          },
        ],
      },
      {
        item: 'passwordGroup.confirmPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Please enter and confirm your new password.',
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

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private resetPassword(data: Object): void {
    this.subscriptions.add(
      this.passwordResetService.changePassword(data).subscribe(
        () => this.resetPasswordEvent.emit(),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }

  public onSubmit(): void {
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      this.submitted = true;
    } else {
      const data = {
        currentPassword: this.form.value.oldPasswordInput,
        newPassword: this.form.value.passwordGroup.createPasswordInput,
      };

      this.resetPassword(data);
    }
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
