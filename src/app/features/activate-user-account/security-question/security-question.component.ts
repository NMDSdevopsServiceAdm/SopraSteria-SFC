import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { SecurityQuestionDirective } from '@shared/directives/user/security-question.directive';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestionDirective {
  private activationToken: string;
  public insideFlow: boolean;
  public flow: string;

  constructor(
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(backLinkService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.activationToken = this.route.snapshot.params.activationToken;
    this.insideFlow = this.route.parent.snapshot.url[0].path === this.activationToken;
    this.flow = this.insideFlow
      ? this.activationToken
      : `activate-account/${this.activationToken}/confirm-account-details`;

    this.setupSubscription();
    this.setBackLink();
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.createAccountService.securityDetails$.subscribe((securityDetails: SecurityDetails) => {
        if (securityDetails) {
          this.preFillForm(securityDetails);
        }
      }),
    );
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
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
