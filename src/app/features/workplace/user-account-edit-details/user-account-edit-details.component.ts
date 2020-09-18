import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-user-account-edit-details',
  templateUrl: './user-account-edit-details.component.html',
})
export class UserAccountEditDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';
  protected userDetails: UserDetails = this.route.snapshot.data.user;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init() {
    this.breadcrumbService.show(JourneyType.ACCOUNT);
    this.prefillForm(this.userDetails);
    this.return = { url: ['/dashboard'], fragment: 'user-accounts' };
  }

  protected save(): void {
    this.changeUserDetails({ ...this.setUserDetails(), isPrimary: this.userDetails.isPrimary });
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService
        .updateUserDetails(this.userDetails.establishmentUid, this.userDetails.uid, userDetails)
        .subscribe(
          () => this.router.navigate(['/workplace', this.userDetails.establishmentUid, 'user', this.userDetails.uid]),
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }
}
