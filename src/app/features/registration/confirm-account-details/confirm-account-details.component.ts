import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationPayload } from '@core/model/registration.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
  protected actionType = 'Registration';

  constructor(
    private backService: BackService,
    private registrationService: RegistrationService,
    private router: Router,
    private userService: UserService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder
  ) {
    super(errorSummaryService, formBuilder);
  }

  protected init() {
    this.setupSubscriptions();
    this.setBackLink();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      combineLatest([
        this.userService.userDetails$,
        this.registrationService.selectedLocationAddress$,
        this.registrationService.selectedWorkplaceService$,
        this.registrationService.loginCredentials$,
        this.registrationService.securityDetails$,
      ]).subscribe(([userDetails, locationAddress, service, loginCredentials, securityDetails]) => {
        this.userDetails = userDetails;
        this.locationAddress = locationAddress;
        this.service = service;
        this.loginCredentials = loginCredentials;
        this.securityDetails = securityDetails;
        this.setAccountDetails();
      })
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: { url: ['/registration/change-your-details'] },
      },
      {
        label: 'Job title',
        data: this.userDetails.jobTitle,
      },
      {
        label: 'Email address',
        data: this.userDetails.email,
      },
      {
        label: 'Contact phone',
        data: this.userDetails.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.loginCredentials.username,
        route: { url: ['/registration/create-username'] },
      },
      {
        label: 'Password',
        data: '******',
      },
    ];

    this.securityInfo = [
      {
        label: 'Security question',
        data: this.securityDetails.securityQuestion,
        route: { url: ['/registration/security-question'] },
      },
      {
        label: 'Security answer',
        data: this.securityDetails.securityQuestionAnswer,
      },
    ];
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/security-question'] });
  }

  private generatePayload(): Array<RegistrationPayload> {
    const payload: any = this.locationAddress;
    payload.locationId = this.service.isCQC ? this.locationAddress.locationId : null;
    payload.mainService = this.service.name;
    payload.mainServiceOther = this.service.otherName ? this.service.otherName : null;
    payload.isRegulated = this.service.isCQC;
    payload.user = this.userDetails;
    payload.user.username = this.loginCredentials.username;
    payload.user.password = this.loginCredentials.password;
    payload.user.securityQuestion = this.securityDetails.securityQuestion;
    payload.user.securityQuestionAnswer = this.securityDetails.securityQuestionAnswer;
    return [payload];
  }

  protected save(): void {
    this.subscriptions.add(
      this.registrationService
        .postRegistration(this.generatePayload())
        .subscribe(
          registration =>
            registration.userstatus === 'PENDING'
              ? this.router.navigate(['/registration/awaiting-approval'])
              : this.router.navigate(['/registration/complete']),
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }

  public onSetReturn(): void {
    this.registrationService.setReturnTo({
      url: ['/registration/confirm-account-details'],
    });
  }
}
