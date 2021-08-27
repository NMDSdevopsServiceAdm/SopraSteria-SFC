import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CreateUsernameDirective } from '@shared/directives/user/create-username.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-username-password',
  templateUrl: './username-password.component.html',
})
export class UsernamePasswordComponent extends CreateUsernameDirective {
  public createAccountNewDesign: boolean;

  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
    private featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.return = this.registrationService.returnTo$.value;
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
    });
  }

  public setBackLink(): void {
    if (this.return) {
      const url = this.createAccountNewDesign ? 'confirm-details' : 'confirm-account-details';
      this.backService.setBackLink({ url: ['registration', url] });
      return;
    }
    this.backService.setBackLink({ url: ['registration', 'your-details'] });
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
    if (this.createAccountNewDesign) {
      return this.return ? '/registration/confirm-details' : '/registration/create-security-question';
    }
    return this.return ? '/registration/confirm-account-details' : '/registration/create-security-question';
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
