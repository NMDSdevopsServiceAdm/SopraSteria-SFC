import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CreateUsernameDirective } from '@features/account/create-username/create-username';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent extends CreateUsernameDirective {
  private activationToken: string;

  constructor(
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.callToActionLabel = 'Save and continue';
    this.activationToken = this.route.snapshot.params.activationToken;
    this.setBackLink();
  }

  protected setBackLink(): void {
    this.return = this.createAccountService.returnTo$.value;

    if (this.return) {
      this.backService.setBackLink(this.return);
    }
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.createAccountService.loginCredentials$.subscribe((loginCredentials: LoginCredentials) => {
        if (loginCredentials) {
          this.preFillForm(loginCredentials);
        }
      }),
    );
  }

  protected save(): void {
    this.router
      .navigate([
        '/activate-account',
        this.activationToken,
        this.return ? 'confirm-account-details' : 'security-question',
      ])
      .then(() => {
        this.createAccountService.loginCredentials$.next({
          username: this.getUsername.value,
          password: this.getPassword.value,
        });
      });
  }
}
