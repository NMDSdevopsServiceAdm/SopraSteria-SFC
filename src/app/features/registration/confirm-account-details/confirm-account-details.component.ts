import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationAddress } from '@core/model/location-address.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { RegistrationPayload } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
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
  private securityDetails: SecurityDetails;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();
  private userDetails: UserDetails;
  private username: string;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private userService: UserService
  ) {}

  get getTermsAndConditions() {
    return this.form.get('termsAndConditions');
  }

  ngOnInit() {
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      termsAndConditions: ['', Validators.required],
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
      this.registrationService.loginCredentials$.subscribe(
        (loginCredentials: LoginCredentials) => (this.username = loginCredentials.username)
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
        name: -400,
        message: 'Unknown location.',
      },
      {
        name: -300,
        message: 'Unexpected main service ID.',
      },
      {
        name: -200,
        message: 'Duplicate username.',
      },
      {
        name: -100,
        message: 'Duplicate non-CQC establishment.',
      },
      {
        name: -150,
        message: 'Duplicate CQC establishment.',
      },
      {
        name: -190,
        message: 'Duplicate establishment.',
      },
      {
        name: -600,
        message: 'Unknown NMDS letter/CSSR region.',
      },
      {
        name: -500,
        message: 'Unknown NMDS sequence.',
      },
    ];
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/security-question'] });
  }

  private generatePayload(): RegistrationPayload {
    const payload: any = this.locationAddress;
    payload.user = this.userDetails;

    return payload;
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
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
