import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivateAccountRequest } from '@core/model/account.model';
import { InviteResponse } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ConfirmAccountDetailsDirective } from '@shared/directives/user/confirm-account-details.directive';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
  standalone: false,
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
        this.createAccountService.userResearchInviteResponse$,
      ]).subscribe(([userDetails, loginCredentials, securityDetails, userResearchInviteResponse]) => {
        this.userDetails = userDetails;
        this.loginCredentials = loginCredentials;
        this.securityDetails = securityDetails;
        this.userResearchInviteResponse = userResearchInviteResponse;
        this.setAccountDetails();
      }),
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: this.getRoute('change-your-details'),
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
        route: this.getRoute('create-username'),
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
        route: this.getRoute('security-question'),
      },
      {
        label: 'Answer',
        data: this.securityDetails.securityQuestionAnswer,
      },
    ];

    this.userResearchInviteResponseInfo = [
      {
        label: 'User research sessions',
        data: this.setUserResearchInviteResponseValue(),
        route: this.getRoute('user-research-invite'),
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
      userResearchInviteResponse: this.userResearchInviteResponse,
    };
  }

  private setUserResearchInviteResponseValue(): string {
    if (this.userResearchInviteResponse === null) {
      return '-';
    }

    return this.userResearchInviteResponse === InviteResponse.Yes ? 'Yes' : 'No';
  }
  public setTermsAndConditionsCheckbox(): void {
    const checked = !this.form.get('termsAndConditions')?.value;

    this.termsAndConditionsCheckbox = checked;
    this.createAccountService.termsAndConditionsCheckbox$.next(checked);
  }

  public save(): void {
    this.subscriptions.add(
      this.createAccountService.activateAccount(this.generatePayload()).subscribe(
        () => this.router.navigate(['/activate-account', this.activationToken, 'complete']),
        (error: HttpErrorResponse) => this._onError(error),
      ),
    );
  }

  private _onError(error: HttpErrorResponse): void {
    if (error.status === 403 || error.status === 404) {
      this.router.navigate(['/problem-with-the-service']);
    } else if (error.status === 401 && error?.error?.message === 'Activation link expired') {
      this.router.navigate(['/activate-account', '/expired-activation-link']);
    } else {
      this.onError(error);
    }
  }

  public onSetReturn(): void {
    this.createAccountService.setReturnTo({
      url: ['/activate-account', this.activationToken, 'confirm-account-details'],
    });
  }

  private getRoute(path: string): { url: string[] } {
    return {
      url: ['/activate-account', this.activationToken, 'confirm-account-details', path],
    };
  }
}
