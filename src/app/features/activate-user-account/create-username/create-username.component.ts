import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CreateUsernameDirective } from '@shared/directives/user/create-username.directive';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent extends CreateUsernameDirective {
  private activationToken: string;

  constructor(
    private createAccountService: CreateAccountService,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
  ) {
    super(backLinkService, errorSummaryService, formBuilder, registrationService, route, router);
  }

  protected init(): void {
    this.activationToken = this.route.snapshot.params.activationToken;
    this.insideFlow = this.route.snapshot.parent.url[0].path === this.activationToken;
    this.flow = this.insideFlow
      ? this.activationToken
      : `activate-account/${this.activationToken}/confirm-account-details`;
    this.return = this.registrationService.returnTo$.value;
  }

  // protected setBackLink(): void {
  //   this.return = this.createAccountService.returnTo$.value;

  //   if (this.return) {
  //     this.backService.setBackLink(this.return);
  //   }
  // }

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
        this.insideFlow ? 'security-question' : 'confirm-account-details',
      ])
      .then(() => {
        this.createAccountService.loginCredentials$.next({
          username: this.getUsername.value,
          password: this.getPassword.value,
        });
      });
  }
}
