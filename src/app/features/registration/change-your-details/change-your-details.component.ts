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
    protected userService: UserService,
  ) {
    super(backService, errorSummaryService, fb, router, userService);
  }

  protected init() {
    this.setupSubscriptions();
    this.setBackLink();
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => this.prefillForm(userDetails))
    );

    this.subscriptions.add(
      this.registrationService.registrationInProgress$.subscribe(
        (registrationInProgress: boolean) => this.registrationInProgress = registrationInProgress
      )
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.username = userDetails.username;

      this.form.setValue({
        email: userDetails.email,
        fullName: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected onFormValidSubmit(): void {
    if (this.registrationInProgress) {
      this.userService.updateState(this.setUserDetails());
      this.router.navigate([ '/registration/confirm-account-details' ]);
    } else {
      this.changeUserDetails(this.userDetails);
    }
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/confirm-account-details'] });
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(this.username, userDetails).subscribe(
        () => this.router.navigate(['/account-management/your-account']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
