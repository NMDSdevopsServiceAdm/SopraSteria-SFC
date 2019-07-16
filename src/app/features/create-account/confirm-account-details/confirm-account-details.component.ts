import { combineLatest, Subscription } from 'rxjs';
import { CompleteCreateAccountRequest } from '@core/model/account.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { SummaryList } from '@core/model/summary-list.model';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent implements OnInit, OnDestroy {
  private loginCredentials: LoginCredentials;
  private securityDetails: SecurityDetails;
  private serverErrorsMap: ErrorDefinition[];
  private subscriptions: Subscription = new Subscription();
  protected serverError: string;
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public userInfo: SummaryList[];

  constructor(
    private createAccountService: CreateAccountService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSubscriptions();
    this.setupServerErrorsMap();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment.',
      },
      {
        name: 400,
        message: 'Unable to create user.',
      },
    ];
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      combineLatest(this.createAccountService.loginCredentials$, this.createAccountService.securityDetails$).subscribe(
        ([loginCredentials, securityDetails]) => {
          this.loginCredentials = loginCredentials;
          this.securityDetails = securityDetails;
          this.setAccountDetails();
        }
      )
    );
  }

  // TODO update email, fullname, jobTitle, password props once BE exposes this info in token
  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: null,
        route: '/create-account/change-your-details',
      },
      {
        label: 'Job title',
        data: null,
      },
      {
        label: 'Email address',
        data: null,
      },
      {
        label: 'Contact phone',
        data: null,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.loginCredentials.username,
        route: '/create-account/create-username',
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
        route: '/create-account/security-question',
      },
      {
        label: 'Security answer',
        data: this.securityDetails.securityAnswer,
      },
    ];
  }

  // TODO update email, fullname, jobTitle, password props once BE exposes this info in token
  private generateRequest(): CompleteCreateAccountRequest {
    return {
      email: '',
      fullname: '',
      jobTitle: '',
      password: this.loginCredentials.password,
      phone: '',
      securityQuestion: this.securityDetails.securityQuestion,
      securityQuestionAnswer: this.securityDetails.securityAnswer,
      username: this.loginCredentials.username,
    };
  }

  public save(): void {
    this.subscriptions.add(
      this.createAccountService
        .completeCreateAccount(this.generateRequest())
        .subscribe(
          () => this.router.navigate(['/create-account/complete']),
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }

  protected onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
