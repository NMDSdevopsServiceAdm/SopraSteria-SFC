import { AccountDetails } from '@features/account/account-details/account-details';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';
  protected username: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService,
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
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.userDetails = userDetails;
          this.prefillForm(userDetails);
        }
      })
    );

    this.subscriptions.add(
      this.userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
      })
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.email,
        fullName: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    this.changeUserDetails(this.username, this.userDetails);
  }

  private changeUserDetails(username: string, userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(username, userDetails).subscribe(
        () => this.router.navigate(['/account-management']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
