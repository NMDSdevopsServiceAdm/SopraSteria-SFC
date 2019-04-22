import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { debounceTime } from 'rxjs/operators';
import { RegistrationModel } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent implements OnInit, OnDestroy {
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private registration: RegistrationModel;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
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
    this.setupSubscription();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.getUsername.valueChanges.pipe(debounceTime(1000)).subscribe(
        (userName: string) => this.checkUsernameDoesntExist(userName)
      )
    );
  }

  private setupForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
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
            name: 'maxLength',
            message: 'Your username must be no longer than 50 characters.',
          },
        ],
      },
      {
        item: 'password',
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
        item: 'confirmPassword',
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
        (data: RegistrationModel) => {
          console.log(data);
          if (data['status'] === '1') {
            //   this.usernameApiError = data.message;
            //
            //   this.setCreateUsernameMessage(this.getUsername);
            // } else {
            //   this.usernameApiError = null;
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
    const createUsernameValue = this.form.get('username').value;
    const createPasswordValue = this.form.get('passwordGroup.password').value;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      // Get updated form results
      // if (this.registration.locationdata[0].user.hasOwnProperty('securityQuestion')) {
      // this.createSecurityQuestionValue = this.registration.locationdata[0].user.securityQuestion;
      // }
      // if (this.registration.locationdata[0].user.hasOwnProperty('securityAnswer')) {
      // this.createsecurityAnswerValue = this.registration.locationdata[0].user.securityAnswer;
      // }
    }

    // this.registration.locationdata[0].user['username'] = createUsernameValue;
    // this.registration.locationdata[0].user['password'] = createPasswordValue;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      // Get updated form results
      // if (this.registration.locationdata[0].user.hasOwnProperty('securityQuestion')) {
      //   this.registration.locationdata[0].user['securityQuestion'] = this.createSecurityQuestionValue;
      // }
      // if (this.registration.locationdata[0].user.hasOwnProperty('securityAnswer')) {
      //   this.registration.locationdata[0].user['securityAnswer'] = this.createsecurityAnswerValue;
      // }
    }

    this.registrationService.updateState(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      this.router.navigate(['/registration/confirm-account-details']);
    } else {
      this.router.navigate(['/registration/security-question']);
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
