import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ALPHA_NUMERIC_WITH_HYPHENS_UNDERSCORES, PASSWORD_PATTERN } from '@core/constants/constants';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

/*eslint @typescript-eslint/no-empty-function: ["error", { allow: ['methods'] }]*/
@Directive()
export class CreateUsernameDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public callToActionLabel: string;
  public form: FormGroup;
  public flow: string;
  public insideFlow: boolean;
  public serverError: string;
  public submitted = false;
  public return: URLStructure;
  public showPassword = false;
  public userAccountSections: string[];
  public workplaceSections: string[];
  protected formErrorsMap: Array<ErrorDetails>;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected userNameMaxLength = 120;
  protected userNameMinLength = 3;

  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected route: ActivatedRoute,
    protected router: Router,
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
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.init();
    this.setCallToActionLabel();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected setupSubscriptions(): void {}

  protected setCallToActionLabel(): void {}

  protected preFillForm(loginCredentials: LoginCredentials): void {
    if (loginCredentials) {
      this.getUsername.setValue(loginCredentials.username);
      this.getPassword.setValue(loginCredentials.password);
      this.getConfirmPassword.setValue(loginCredentials.password);
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
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
          { validators: [CustomValidators.matchInputValues], updateOn: 'submit' },
        ),
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'username',
        type: [
          {
            name: 'required',
            message: 'Enter your username',
          },
          {
            name: 'maxlength',
            message: `Username must be ${this.userNameMaxLength} characters or fewer`,
          },
          {
            name: 'minlength',
            message: `Username must be ${this.userNameMinLength} characters or more`,
          },
          {
            name: 'usernameExists',
            message: 'Enter a different username, this one is not available',
          },
          {
            name: 'pattern',
            message: 'Username can only contain letters, numbers, underscores and hyphens',
          },
        ],
      },
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
            message: 'Enter the password again',
          },
          {
            name: 'notMatched',
            message: 'Confirmation password does not match the password you entered',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'Database error',
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
          }),
        )
        .subscribe(
          (data) => {
            if (data[`status`] === '1') {
              this.getUsername.setErrors({ usernameExists: true });
            } else {
              this.getUsername.setErrors({ usernameExists: null });
              this.getUsername.updateValueAndValidity();
            }
          },
          (error: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
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

  public togglePasswordShow(event: Event): void {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
