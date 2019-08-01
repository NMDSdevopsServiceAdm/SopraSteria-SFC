import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivateAccountRequest } from '@core/model/account.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
  protected actionType = 'Account activation';
  private activationToken: string;

  constructor(
    private route: ActivatedRoute,
    private backService: BackService,
    private createAccountService: CreateAccountService,
    private router: Router,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder
  ) {
    super(errorSummaryService, formBuilder);
  }

  protected init() {
    this.activationToken = this.route.snapshot.params.activationToken;
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
        route: { url: ['/activate-account', this.activationToken, 'change-your-details'] },
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
        route: { url: ['/activate-account', this.activationToken, 'create-username'] },
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
        route: { url: ['/activate-account', this.activationToken, 'security-question'] },
      },
      {
        label: 'Security answer',
        data: this.securityDetails.securityQuestionAnswer,
      },
    ];
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/activate-account', this.activationToken, 'security-question'] });
  }

  private generatePayload(): ActivateAccountRequest {
    return {
      email: this.userDetails.email,
      fullname: this.userDetails.fullname,
      jobTitle: this.userDetails.jobTitle,
      password: this.loginCredentials.password,
      phone: this.userDetails.phone,
      securityQuestion: this.securityDetails.securityQuestion,
      securityQuestionAnswer: this.securityDetails.securityQuestionAnswer,
      username: this.loginCredentials.username,
      addUserUUID: this.activationToken,
    };
  }

  protected save(): void {
    this.subscriptions.add(
      this.createAccountService
        .activateAccount(this.generatePayload())
        .subscribe(
          () => this.router.navigate(['/activate-account', this.activationToken, 'complete']),
          (error: HttpErrorResponse) => this._onError(error)
        )
    );
  }

  private _onError(error) {
    if (error.status === 403 || error.status === 404) {
      this.router.navigate(['/problem-with-the-service']);
    } else {
      this.onError(error);
    }
  }

  public onSetReturn(): void {
    this.createAccountService.setReturnTo({
      url: ['/activate-account', this.activationToken, 'confirm-account-details'],
    });
  }
}
