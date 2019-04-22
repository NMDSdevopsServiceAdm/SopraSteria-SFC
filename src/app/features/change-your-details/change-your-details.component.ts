import { YourDetailsComponent } from '@features/registration/your-details/your-details.component';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Component } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './../registration/your-details/your-details.component.html',
})
export class ChangeYourDetailsComponent extends YourDetailsComponent {
  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService
  ) {
    super(errorSummaryService, fb, router, userService);
  }

  protected init() {
    this.getUserDetails();
  }

  private getUserDetails(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => this.prefillForm(userDetails))
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.username = userDetails.username;

      this.form.setValue({
        userEmailInput: userDetails.email,
        userFullnameInput: userDetails.fullname,
        userJobTitleInput: userDetails.jobTitle,
        userPhoneInput: userDetails.phone,
      });
    }
  }

  protected onFormValidSubmit(): void {
    this.changeUserDetails(this.userDetails);
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(this.username, userDetails).subscribe(
        () => this.router.navigate(['/your-account']),
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
