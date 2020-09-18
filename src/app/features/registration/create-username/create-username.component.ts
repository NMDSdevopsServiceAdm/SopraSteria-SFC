import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
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
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.return = this.registrationService.returnTo$.value;
    this.setBackLink();
  }

  protected setCallToActionLabel(): void {
    const label: string = this.return ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }

  protected setBackLink(): void {
    const route: string = this.return ? this.return.url[0] : '/registration/your-details';
    this.backService.setBackLink({ url: [route] });
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.loginCredentials$.subscribe((loginCredentials: LoginCredentials) => {
        if (loginCredentials) {
          this.preFillForm(loginCredentials);
        }
      }),
    );
  }

  protected setFormSubmissionLink(): string {
    return this.return ? this.return.url[0] : '/registration/security-question';
  }

  protected save(): void {
    this.router.navigate([this.setFormSubmissionLink()]).then(() => {
      this.registrationService.loginCredentials$.next({
        username: this.getUsername.value,
        password: this.getPassword.value,
      });
    });
  }
}
