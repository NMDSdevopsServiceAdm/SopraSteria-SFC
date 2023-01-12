import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { SecurityQuestionDirective } from '@shared/directives/user/security-question.directive';

@Component({
  selector: 'app-create-security-question',
  templateUrl: './create-security-question.component.html',
})
export class SecurityQuestionComponent extends SecurityQuestionDirective {
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;
  public flow: string;

  constructor(
    private registrationService: RegistrationService,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private route: ActivatedRoute,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.return = this.registrationService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
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

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
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
