import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { CreateUsername } from '@features/account/create-username/create-username';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
})
export class CreateUsernameComponent extends CreateUsername {
  constructor(
    private createAccountService: CreateAccountService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.callToActionLabel = 'Save and continue';
  }

  protected setBackLink(): void {
    const route: string = this.loginCredentialsExist ? '/create-account/security-question' : '/create-account';
    this.backService.setBackLink({ url: [route] });
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.createAccountService.loginCredentials$.subscribe((loginCredentials: LoginCredentials) => {
        if (loginCredentials) {
          this.loginCredentialsExist = true;
          this.preFillForm(loginCredentials);
        }
      })
    );
  }

  protected save(): void {
    this.router.navigate(['/create-account/security-question']).then(() => {
      this.createAccountService.loginCredentials$.next({
        username: this.getUsername.value,
        password: this.getPassword.value,
      });
    });
  }
}
