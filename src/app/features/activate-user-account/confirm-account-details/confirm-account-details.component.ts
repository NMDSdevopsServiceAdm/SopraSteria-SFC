import { ActivateAccountRequest } from '@core/model/account.model';
import { BackService } from '@core/services/back.service';
import { combineLatest } from 'rxjs';
import { Component } from '@angular/core';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
  protected actionType = 'Account activation';

  constructor(
    private backService: BackService,
    private createAccountService: CreateAccountService,
    private router: Router,
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
        this.createAccountService.userDetails$,
        this.createAccountService.loginCredentials$,
        this.createAccountService.securityDetails$
      ).subscribe(([userDetails, loginCredentials, securityDetails]) => {
        this.userDetails = userDetails;
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
        route: '/activate-account/change-your-details',
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
        route: '/activate-account/create-username',
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
        route: '/activate-account/security-question',
      },
      {
        label: 'Security answer',
        data: this.securityDetails.securityAnswer,
      },
    ];
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/activate-account/security-question'] });
  }

  private generatePayload(): ActivateAccountRequest {
    return {
      email: this.userDetails.email,
      fullname: this.userDetails.fullname,
      jobTitle: this.userDetails.jobTitle,
      password: this.loginCredentials.password,
      phone: this.userDetails.phone,
      securityQuestion: this.securityDetails.securityQuestion,
      securityQuestionAnswer: this.securityDetails.securityAnswer,
      username: this.loginCredentials.username,
    };
  }

  protected save(): void {
    this.subscriptions.add(
      this.createAccountService
        .activateAccount(this.generatePayload())
        .subscribe(
          () => this.router.navigate(['/activate-account/complete']),
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }
}
