import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SecurityQuestionDirective } from '@shared/directives/user/security-question.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-create-security-question',
  templateUrl: './create-security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestionDirective {
  public createAccountNewDesign: boolean;

  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
    });
    this.return = this.registrationService.returnTo$.value;
    this.setBackLink();
    this.setupSubscription();
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

  protected setBackLink(): void {
    const route: string = this.return ? this.return.url[0] : '/registration/username-password';
    this.backService.setBackLink({ url: [route] });
  }

  protected save(): void {
    if (this.createAccountNewDesign) {
      this.router.navigate(['/registration/confirm-details']).then(() => {
        this.registrationService.securityDetails$.next({
          securityQuestion: this.getSecurityQuestion.value,
          securityQuestionAnswer: this.getSecurityQuestionAnswer.value,
        });
      });
    } else {
      this.router.navigate(['/registration/confirm-account-details']).then(() => {
        this.registrationService.securityDetails$.next({
          securityQuestion: this.getSecurityQuestion.value,
          securityQuestionAnswer: this.getSecurityQuestionAnswer.value,
        });
      });
    }
  }

  protected setCallToActionLabel(): void {
    const label: string = this.return ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }
}
