import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsComponent } from '@features/account/account-details/account-details.component';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetailsComponent {
  public callToActionLabel = 'Save and return';
  // protected registrationInProgress: boolean;

  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
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
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.userDetails = userDetails;
          this.prefillForm(userDetails);
        }
      })
    );

    // this.subscriptions.add(
    //   this.registrationService.registrationInProgress$.subscribe(
    //     (registrationInProgress: boolean) => (this.registrationInProgress = registrationInProgress)
    //   )
    // );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.emailAddress,
        fullName: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.contactNumber,
      });
    }
  }

  // protected updateUserDetails(): UserDetails {
  //   this.userDetails.emailAddress = this.getEmail.value;
  //   this.userDetails.fullname = this.getFullName.value;
  //   this.userDetails.jobTitle = this.getJobTitle.value;
  //   this.userDetails.contactNumber = this.getPhone.value;
  //
  //   return this.userDetails;
  // }

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    this.router.navigate(['/registration/confirm-account-details']);

    // if (this.registrationInProgress) {
    //   this.router.navigate(['/registration/confirm-account-details']);
    // } else {
    //   this.changeUserDetails(this.userDetails);
    // }
  }

  protected setBackLink(): void {
    // const url: string = this.registrationInProgress ? '/registration/confirm-account-details' : '/account-management';
    // this.backService.setBackLink({ url: [url] });
    this.backService.setBackLink({ url: ['/registration/confirm-account-details'] });
  }

  // private changeUserDetails(userDetails: UserDetails): void {
  //   this.subscriptions.add(
  //     this.userService.updateUserDetails(userDetails).subscribe(
  //       () => this.router.navigate(['/account-management']),
  //       (error: HttpErrorResponse) => {
  //         this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
  //       }
  //     )
  //   );
  // }
}
