import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivateAccountRequest } from '@core/model/account.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ConfirmAccountDetailsDirective } from '@shared/directives/user/confirm-account-details.directive';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetailsDirective {
  protected actionType = 'Account activation';
  private activationToken: string;
  public termsAndConditionsCheckbox: boolean;

  constructor(
    protected route: ActivatedRoute,
    private backLinkService: BackLinkService,
    private createAccountService: CreateAccountService,
    private router: Router,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
  ) {
    super(errorSummaryService, formBuilder, route);
  }

  protected init() {
    this.activationToken = this.route.snapshot.params.activationToken;
    this.setupSubscriptions();
    this.termsAndConditionsCheckbox = false;
    this.setBackLink();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      combineLatest([
        this.createAccountService.userDetails$,
        this.createAccountService.loginCredentials$,
        this.createAccountService.securityDetails$,
      ]).subscribe(([userDetails, loginCredentials, securityDetails]) => {
        this.userDetails = userDetails;
        this.loginCredentials = loginCredentials;
        this.securityDetails = securityDetails;
        this.setAccountDetails();
      }),
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: { url: ['/activate-account', this.activationToken, 'confirm-account-details', 'change-your-details'] },
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
        label: 'Phone number',
        data: this.userDetails.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.loginCredentials.username,
        route: { url: ['/activate-account', this.activationToken, 'confirm-account-details', 'create-username'] },
      },
      {
        label: 'Password',
        data: this.loginCredentials.password,
      },
    ];

    this.securityInfo = [
      {
        label: 'Security question',
        data: this.securityDetails.securityQuestion,
        route: { url: ['/activate-account', this.activationToken, 'confirm-account-details', 'security-question'] },
      },
      {
        label: 'Answer',
        data: this.securityDetails.securityQuestionAnswer,
      },
    ];
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
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
  public setTermsAndConditionsCheckbox() {
    this.termsAndConditionsCheckbox = !this.form.get('termsAndConditions').value;
    this.createAccountService.termsAndConditionsCheckbox$.next(this.termsAndConditionsCheckbox);
  }
  public save(): void {
    this.subscriptions.add(
      this.createAccountService.activateAccount(this.generatePayload()).subscribe(
        () => this.router.navigate(['/activate-account', this.activationToken, 'complete']),
        (error: HttpErrorResponse) => this._onError(error),
      ),
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
