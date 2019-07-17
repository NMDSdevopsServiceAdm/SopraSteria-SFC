import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { finalize } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { SecurityQuestion } from '@features/account/security-question/security-question';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestion {
  private establishmentUid: string;

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
    this.setupSubscription();
    this.establishmentUid = this.route.snapshot.data.establishmentUid;
  }

  protected setBackLink(): void {
    const route: string = this.securityDetailsExist ? 'confirm-account-details' : 'create-username';
    this.backService.setBackLink({ url: ['/activate-account', this.establishmentUid, route] });
  }

  protected setupSubscription(): void {
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
    this.router.navigate(['/activate-account', this.establishmentUid, '/security-question']).then(() => {
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
