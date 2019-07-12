import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SecurityQuestion } from '@features/account/security-question/security-question';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestion {
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.setBackLink();
  }

  protected setBackLink(): void {
    const route: string = this.securityDetailsExist
      ? '/registration/confirm-account-details'
      : '/registration/create-username';
    this.backService.setBackLink({ url: [route] });
  }

  protected save(): void {
    this.registrationService.securityDetails$.next({
      securityQuestion: this.getSecurityQuestion.value,
      securityAnswer: this.getSecurityAnswer.value,
    });

    this.router.navigate(['/registration/confirm-account-details']);
  }

  protected setCallToActionLabel(): void {
    const label: string = this.securityDetailsExist ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }
}
