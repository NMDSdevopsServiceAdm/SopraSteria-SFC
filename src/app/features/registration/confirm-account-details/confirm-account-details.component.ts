import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Subscription } from 'rxjs';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent implements OnInit, OnDestroy {
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();
  private username: string;
  private securityDetails: SecurityDetails;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
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
      termsAndConditions: ['', Validators.required]
    });
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.loginCredentials$.subscribe(
        (loginCredentials: LoginCredentials) => this.username = loginCredentials.username
      )
    );

    this.subscriptions.add(
      this.registrationService.securityDetails$.subscribe(
        (securityDetails: SecurityDetails) => this.securityDetails = securityDetails
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
          }
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

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/security-question'] });
  }

  private submit(): void {
    // this.registrationService.postRegistration(this.registration);
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
