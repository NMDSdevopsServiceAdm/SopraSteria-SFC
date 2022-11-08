import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { SecurityQuestionDirective } from '@shared/directives/user/security-question.directive';

@Component({
  selector: 'app-change-user-security',
  templateUrl: './change-user-security.component.html',
})
export class ChangeUserSecurityComponent extends SecurityQuestionDirective {
  private serverErrorsMap: Array<ErrorDefinition>;
  public userDetails: UserDetails;
  private primaryWorkplace: Establishment;
  public serverError: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.return = { url: ['/account-management'] };
    this.breadcrumbService.show(JourneyType.ACCOUNT);
    this.setupSubscription();
    this.setupServerErrorsMap();

    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe((user) => {
        this.userDetails = user;
        this.preFillForm({
          securityQuestion: user.securityQuestion,
          securityQuestionAnswer: user.securityQuestionAnswer,
        });
      }),
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

  private changeUserDetails(userDetails: UserDetails): void {
    if (this.userDetails.role.includes('Admin')) {
      this.updateAdminUser(userDetails);
    } else {
      this.updateUser(userDetails);
    }
  }

  private updateUser(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(this.primaryWorkplace.uid, this.userDetails.uid, userDetails).subscribe(
        (data) => {
          this.userService.loggedInUser = { ...this.userDetails, ...data };
          this.router.navigate(['/account-management']);
        },
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  private updateAdminUser(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateAdminUserDetails(this.userDetails.uid, userDetails).subscribe(
        (data) => {
          this.userService.loggedInUser = { ...this.userDetails, ...data };
          this.router.navigate(['/account-management']);
        },
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  protected save(): void {
    this.userDetails.securityQuestion = this.getSecurityQuestion.value;
    this.userDetails.securityQuestionAnswer = this.getSecurityQuestionAnswer.value;
    this.changeUserDetails(this.userDetails);
  }
}
