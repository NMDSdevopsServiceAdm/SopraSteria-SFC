import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistrationPayload } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
    protected userService: UserService
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router, userService);
  }

  protected init() {
    this.setBackLink();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/security-question'] });
  }

  private generatePayload(): Array<RegistrationPayload> {
    const payload: any = this.locationAddress;
    payload.locationId = this.workplaceService.isCQC ? this.locationAddress.locationId : null;
    payload.mainService = this.workplaceService.name;
    payload.mainServiceOther = this.workplaceService.otherName ? this.workplaceService.otherName : null;
    payload.isRegulated = this.workplaceService.isCQC;
    payload.user = this.userDetails;
    payload.user.username = this.loginCredentials.username;
    payload.user.password = this.loginCredentials.password;
    payload.user.securityQuestion = this.securityDetails.securityQuestion;
    payload.user.securityQuestionAnswer = this.securityDetails.securityAnswer;
    return [payload];
  }

  protected save(): void {
    this.subscriptions.add(
      this.registrationService.postRegistration(this.generatePayload()).subscribe(
        () => this.router.navigate(['/registration/complete']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }
}
