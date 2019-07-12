import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { combineLatest, Subscription } from 'rxjs';

export class ConfirmAccountDetails implements OnInit, OnDestroy {
  protected formErrorsMap: Array<ErrorDetails>;
  protected locationAddress: LocationAddress;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected workplaceService: Service;
  public form: FormGroup;
  public loginCredentials: LoginCredentials;
  public securityDetails: SecurityDetails;
  public serverError: string;
  public submitted = false;
  public userDetails: UserDetails;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
    protected userService: UserService,
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.init();
  }

  protected init(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
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
        name: 400,
        message: 'Registration failed.',
      },
    ];
  }

  protected setBackLink(): void {}

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
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
