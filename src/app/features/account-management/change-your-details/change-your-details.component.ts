import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';
  public user: UserDetails;
  protected username: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init() {
    this.breadcrumbService.show();
    this.setupSubscriptions();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/account-management'] });
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe(user => {
        this.userDetails = user;
        this.prefillForm(user);
      })
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.email,
        fullname: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected save(): void {
    const details = this.setUserDetails();
    this.userService.updateState(details);
    this.changeUserDetails(details);
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(this.userDetails.username, userDetails).subscribe(
        data => {
          this.userService.loggedInUser = { ...this.userDetails, ...data };
          this.router.navigate(['/account-management']);
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }
}
