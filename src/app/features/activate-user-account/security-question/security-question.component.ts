import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { SecurityQuestion } from '@features/account/security-question/security-question';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestion {
  private activationToken: string;

  constructor(
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.activationToken = this.route.snapshot.params.activationToken;
    this.setupSubscription();
    this.setBackLink();
  }

  protected setBackLink(): void {
    this.return = this.createAccountService.returnTo$.value;
    this.back = this.return ? this.return : { url: ['/activate-account', this.activationToken, 'create-username'] };
    this.backService.setBackLink(this.back);
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.createAccountService.securityDetails$
        .subscribe((securityDetails: SecurityDetails) => {
          if (securityDetails) {
            this.preFillForm(securityDetails);
          }
        })
    );
  }

  protected save(): void {
    this.router.navigate(['/activate-account', this.activationToken, 'confirm-account-details']).then(() => {
      this.createAccountService.securityDetails$.next({
        securityQuestion: this.getSecurityQuestion.value,
        securityQuestionAnswer: this.getSecurityQuestionAnswer.value,
      });
    });
  }
}
