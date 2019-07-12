import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Component } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { SecurityQuestion } from '@features/account/security-question/security-question';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-change-user-security',
  templateUrl: './change-user-security.component.html',
})
export class ChangeUserSecurityComponent extends SecurityQuestion {
  private serverErrorsMap: Array<ErrorDefinition>;
  private userDetails: UserDetails;
  private username: string;
  public serverError: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, registrationService, router);
  }

  protected init(): void {
    this.breadcrumbService.show();
    this.setupSubscriptions();
    this.setupServerErrorsMap();
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.userDetails = userDetails;
          this.preFillForm({
            securityQuestion: userDetails.securityQuestion,
            securityAnswer: userDetails.securityQuestionAnswer,
          });
        }
      })
    );

    this.subscriptions.add(
      this.userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
      })
    );
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment.',
      },
    ];
  }

  private changeUserDetails(username: string, userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(username, userDetails).subscribe(
        () => this.router.navigate(['/account-management']),
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }

  protected save(): void {
    this.userDetails.securityQuestion = this.getSecurityQuestion.value;
    this.userDetails.securityQuestionAnswer = this.getSecurityAnswer.value;
    this.changeUserDetails(this.username, this.userDetails);
  }

  protected setCallToActionLabel(): void {
    this.callToActionLabel = 'Save and return';
  }
}
