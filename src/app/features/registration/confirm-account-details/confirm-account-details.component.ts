import { BackService } from '@core/services/back.service';
import { combineLatest } from 'rxjs';
import { Component } from '@angular/core';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistrationPayload } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
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
      combineLatest(
        this.userService.userDetails$,
        this.registrationService.selectedLocationAddress$,
        this.registrationService.selectedWorkplaceService$,
        this.registrationService.loginCredentials$,
        this.registrationService.securityDetails$
      ).subscribe(([userDetails, locationAddress, workplaceService, loginCredentials, securityDetails]) => {
        this.userDetails = userDetails;
        this.locationAddress = locationAddress;
        this.workplaceService = workplaceService;
        this.loginCredentials = loginCredentials;
        this.securityDetails = securityDetails;
        this.setAccountDetails();
      })
    );
  }

  private setAccountDetails(): void {
    this.accountDetails = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: '/registration/change-your-details',
      },
      {
        label: 'Job title',
        data: this.userDetails.jobTitle,
        route: '/registration/change-your-details',
      },
      {
        label: 'Email address',
        data: this.userDetails.email,
        route: '/registration/change-your-details',
      },
      {
        label: 'Contact phone',
        data: this.userDetails.phone,
        route: '/registration/change-your-details',
      },
      {
        label: 'Username',
        data: this.loginCredentials.username,
        route: '/registration/create-username',
      },
      {
        label: 'Security question',
        data: this.securityDetails.securityQuestion,
        route: '/registration/security-question',
      },
      {
        label: 'Security answer',
        data: this.securityDetails.securityAnswer,
        route: '/registration/security-question',
      },
    ];
  }

  protected setBackLink(): void {
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
    payload.user.securityQuestionAnswer = this.securityDetails.securityAnswer;
    return [payload];
  }

  protected save(): void {
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
}
