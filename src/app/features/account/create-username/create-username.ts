import { ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES, PASSWORD_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { OnDestroy, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

export class CreateUsername implements OnInit, OnDestroy {
  protected formErrorsMap: Array<ErrorDetails>;
  protected loginCredentialsExist = false;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected userNameMaxLength = 120;
  protected userNameMinLength = 3;
  public callToActionLabel: string;
  public form: FormGroup;
  public serverError: string;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {}

  // Get password group
  get getPasswordGroup() {
    return this.form.get('passwordGroup');
  }

  // Get username
  get getUsername() {
    return this.form.get('username');
  }

  // Get password
  get getPassword() {
    return this.getPasswordGroup.get('createPasswordInput');
  }

  // Get confirm password
  get getConfirmPassword() {
    return this.getPasswordGroup.get('confirmPasswordInput');
  }

  ngOnInit() {
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setCallToActionLabel();
    this.setBackLink();
    this.init();
  }

  protected init(): void {}

  protected setBackLink(): void {}

  protected setupSubscriptions(): void {}

  private setCallToActionLabel(): void {
    const label: string = this.loginCredentialsExist ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }

  protected preFillForm(loginCredentials: LoginCredentials): void {
    if (loginCredentials) {
      this.getUsername.setValue(loginCredentials.username);
      this.getPassword.setValue(loginCredentials.password);
      this.getConfirmPassword.setValue(loginCredentials.password);
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.userNameMaxLength),
          Validators.minLength(this.userNameMinLength),
          Validators.pattern(ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES),
        ],
      ],
      passwordGroup: this.formBuilder.group(
        {
          createPasswordInput: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
          confirmPasswordInput: ['', [Validators.required]],
        },
        { validator: CustomValidators.matchInputValues }
      ),
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'username',
        type: [
          {
            name: 'required',
            message: 'Enter a username.',
          },
          {
            name: 'maxlength',
            message: `Your username must be no longer than ${this.userNameMaxLength} characters.`,
          },
          {
            name: 'minlength',
            message: `Your username must be at least ${this.userNameMinLength} characters long.`,
          },
          {
            name: 'usernameExists',
            message: 'The username you entered is unavailable.',
          },
          {
            name: 'pattern',
            message: 'Your username cannot contain special characters, for example @.',
          },
        ],
      },
      {
        item: 'passwordGroup.createPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Enter your password.',
          },
          {
            name: 'pattern',
            message:
              'Your password must be least 8 characters, contain one uppercase and one lowercase letter and a number.',
          },
        ],
      },
      {
        item: 'passwordGroup.confirmPasswordInput',
        type: [
          {
            name: 'required',
            message: 'Confirm your password.',
          },
          {
            name: 'notMatched',
            message: 'The password you entered does not match. Enter the same password.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  public checkUsernameDoesntExist(): void {
    this.subscriptions.add(
      this.registrationService
        .getUsernameDuplicate(this.getUsername.value)
        .pipe(
          finalize(() => {
            this.submitted = true;
            this.onSubmit();
          })
        )
        .subscribe(
          (data: Object) => {
            if (data['status'] === '1') {
              this.getUsername.setErrors({ usernameExists: true });
            } else {
              this.getUsername.setErrors({ usernameExists: null });
              this.getUsername.updateValueAndValidity();
            }
          },
          (error: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          }
        )
    );
  }

  private onSubmit(): void {
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid || this.serverError) {
      this.errorSummaryService.scrollToErrorSummary();
    } else {
      this.save();
    }
  }

  protected save(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
