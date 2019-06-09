import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent implements OnInit, OnDestroy {
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private locationAddress: LocationAddress;
  private loginCredentials: LoginCredentials;
  private securityDetails: SecurityDetails;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();
  private userDetails: UserDetails;
  private workplaceService: Service;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      termsAndConditions: [null, Validators.required],
    });
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => (this.userDetails = userDetails))
    );

    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.locationAddress = locationAddress)
      )
    );

    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe(
        (workplaceService: Service) => (this.workplaceService = workplaceService)
      )
    );

    this.subscriptions.add(
      this.registrationService.loginCredentials$.subscribe(
        (loginCredentials: LoginCredentials) => (this.loginCredentials = loginCredentials)
      )
    );

    this.subscriptions.add(
      this.registrationService.securityDetails$.subscribe(
        (securityDetails: SecurityDetails) => (this.securityDetails = securityDetails)
      )
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'termsAndConditions',
        type: [
          {
            name: 'required',
            message: 'Please agree to the terms and conditions.',
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
      {
        name: 400,
        message: 'Registration failed.',
      },
    ];
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/security-question'] });
  }

  private generatePayload(): Array<RegistrationPayload> {
    const payload: any = this.locationAddress;
    payload.locationId = this.workplaceService.isCQC ? this.locationAddress.locationId : null;
    payload.mainService = this.workplaceService.name;
    payload.mainServiceOther = this.workplaceService.otherName ? this.workplaceService.otherName : null;
    payload.isRegulated = this.workplaceService.isCQC;
    payload.user = this.userDetails;
    payload.user.username = this.loginCredentials.username;
    payload.user.password = this.loginCredentials.password;
    payload.user.securityQuestion = this.securityDetails.securityQuestion;
    payload.user.securityAnswer = this.securityDetails.securityAnswer;

    return [payload];
  }

  private onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.submitRegistration();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private submitRegistration(): void {
    this.subscriptions.add(
      this.registrationService.postRegistration(this.generatePayload()).subscribe(
        () => this.router.navigate(['/registration/complete']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
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
