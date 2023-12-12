import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { CreateUsernameDirective } from '@shared/directives/user/create-username.directive';

@Component({
  selector: 'app-username-password',
  templateUrl: './username-password.component.html',
})
export class UsernamePasswordComponent extends CreateUsernameDirective {
  constructor(
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected registrationService: RegistrationService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backLinkService, errorSummaryService, formBuilder, registrationService, route, router);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.return = this.registrationService.returnTo$.value;
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
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
    return this.return ? '/registration/confirm-details' : '/registration/create-security-question';
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
