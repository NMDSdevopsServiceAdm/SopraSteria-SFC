import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';
import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './../your-details/your-details.component.html',
})
export class ChangeYourDetailsComponent extends YourDetailsComponent {
  protected callToActionLabel = 'Save and return';
  protected registrationInProgress: boolean;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
    protected userService: UserService
  ) {
    super(backService, errorSummaryService, fb, router, userService);
  }

  protected init() {
    this.setupSubscriptions();
    this.setBackLink();
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.userDetails = userDetails;
          this.prefillForm(userDetails);
        }
      })
    );

    this.subscriptions.add(
      this.registrationService.registrationInProgress$.subscribe(
        (registrationInProgress: boolean) => (this.registrationInProgress = registrationInProgress)
      )
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.emailAddress,
        fullName: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected updateUserDetails(): UserDetails {
    this.userDetails.emailAddress = this.getEmail.value;
    this.userDetails.fullname = this.getFullName.value;
    this.userDetails.jobTitle = this.getJobTitle.value;
    this.userDetails.phone = this.getPhone.value;

    return this.userDetails;
  }

  protected onFormValidSubmit(): void {
    this.userService.updateState(this.updateUserDetails());

    if (this.registrationInProgress) {
      this.router.navigate(['/registration/confirm-account-details']);
    } else {
      this.changeUserDetails(this.userDetails);
    }
  }

  protected setBackLink(): void {
    const url: string = this.registrationInProgress
      ? '/registration/confirm-account-details'
      : '/account-management/your-account';
    this.backService.setBackLink({ url: [url] });
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(userDetails).subscribe(
        () => this.router.navigate(['/account-management/your-account']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
