import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES, PASSWORD_PATTERN } from '@core/constants/constants';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent implements OnInit, OnDestroy {
  private callToActionLabel: string;
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private loginCredentialsExist = false;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();
  private userNameMinLength = 3;
  private userNameMaxLength = 120;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
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
    this.setFormSubmissionLink();
  }

  private setBackLink(): void {
    const route: string = this.loginCredentialsExist
      ? '/registration/confirm-account-details'
      : '/registration/your-details';
    this.backService.setBackLink({ url: [route] });
  }

  private setFormSubmissionLink(): string {
    return this.loginCredentialsExist ? '/registration/confirm-account-details' : '/registration/security-question';
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.loginCredentials$.subscribe((loginCredentials: LoginCredentials) => {
        if (loginCredentials) {
          this.loginCredentialsExist = true;
          this.preFillForm(loginCredentials);
        }
      })
    );

    this.subscriptions.add(
      this.getUsername.valueChanges
        .pipe(debounceTime(1000))
        .pipe(distinctUntilChanged())
        .subscribe((userName: string) => this.checkUsernameDoesntExist(userName))
    );
  }

  private setCallToActionLabel(): void {
    const label: string = this.loginCredentialsExist ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }

  private preFillForm(loginCredentials: LoginCredentials): void {
    if (loginCredentials) {
      this.getUsername.setValue(loginCredentials.username);
      this.getPassword.setValue(loginCredentials.password);
      this.getConfirmPassword.setValue(loginCredentials.password);
    }
  }

  private setupForm(): void {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.userNameMaxLength),
          Validators.minLength(this.userNameMinLength),
          Validators.pattern(ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES),
        ],
      ],
      passwordGroup: this.fb.group(
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
            message: 'Please enter your username.',
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
            message: 'Username already exists.',
          },
          {
            name: 'pattern',
            message: 'Only letters, numbers, hyphens and underscores are allowed.',
          },
        ],
      },
      {
        item: 'passwordGroup.createPasswordInput',
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
        item: 'passwordGroup.confirmPasswordInput',
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

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  private checkUsernameDoesntExist(userName: string): void {
    this.subscriptions.add(
      this.registrationService.getUsernameDuplicate(userName).subscribe(
        (data: Object) => {
          if (data['status'] === '1') {
            this.submitted = true;
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

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private save(): void {
    this.router.navigate([this.setFormSubmissionLink()]).then(() => {
      this.registrationService.loginCredentials$.next({
        username: this.getUsername.value,
        password: this.getPassword.value,
      });
    });
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
