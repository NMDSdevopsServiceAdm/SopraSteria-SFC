import { AccountDetails } from '@features/account/account-details/account-details';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';

  constructor(
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

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    this.router.navigate(['/registration/confirm-account-details']);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/confirm-account-details'] });
  }
}
