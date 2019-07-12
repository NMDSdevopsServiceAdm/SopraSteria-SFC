import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { SecurityQuestion } from '@features/account/security-question/security-question';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestion {
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
    this.setupSubscription();
  }

  protected setBackLink(): void {
    const route: string = this.securityDetailsExist
      ? '/create-account/confirm-account-details'
      : '/create-account/create-username';
    this.backService.setBackLink({ url: [route] });
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.createAccountService.securityDetails$
        .pipe(finalize(() => this.setBackLink()))
        .subscribe((securityDetails: SecurityDetails) => {
          if (securityDetails) {
            this.securityDetailsExist = true;
            this.preFillForm(securityDetails);
          }
        })
    );
  }

  protected save(): void {
    this.router.navigate(['/create-account/confirm-account-details']).then(() => {
      this.createAccountService.securityDetails$.next({
        securityQuestion: this.getSecurityQuestion.value,
        securityAnswer: this.getSecurityAnswer.value,
      });
    });
  }

  protected setCallToActionLabel(): void {
    this.callToActionLabel = 'Save and continue';
  }
}
