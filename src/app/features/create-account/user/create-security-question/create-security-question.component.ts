import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SecurityQuestionDirective } from '@shared/directives/user/security-question.directive';

@Component({
  selector: 'app-create-security-question',
  templateUrl: './create-security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestionDirective {
  constructor(
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.return = this.registrationService.returnTo$.value;
    this.setBackLink();
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.registrationService.securityDetails$.subscribe((securityDetails: SecurityDetails) => {
        if (securityDetails) {
          this.preFillForm(securityDetails);
        }
      }),
    );
  }

  public setBackLink(): void {
    if (this.return) {
      const url = 'confirm-details';
      this.backService.setBackLink({ url: ['registration', url] });
      return;
    }
    this.backService.setBackLink({ url: ['registration', 'username-password'] });
  }

  protected save(): void {
    this.router.navigate(['/registration/confirm-details']).then(() => {
      this.registrationService.securityDetails$.next({
        securityQuestion: this.getSecurityQuestion.value,
        securityQuestionAnswer: this.getSecurityQuestionAnswer.value,
      });
    });
  }
}
