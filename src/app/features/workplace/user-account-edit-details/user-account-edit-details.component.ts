import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-user-account-edit-details',
  templateUrl: './user-account-edit-details.component.html',
})
export class UserAccountEditDetailsComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save and return';
  public userDetails: UserDetails = this.route.snapshot.data.user;

  constructor(
    private breadcrumbService: BreadcrumbService,
    protected route: ActivatedRoute,

    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: UntypedFormBuilder,
    protected router: Router,
    protected userService: UserService,
  ) {
    super(backLinkService, errorSummaryService, fb, router, route);
  }

  protected init() {
    this.breadcrumbService.show(JourneyType.EDIT_USER);

    this.prefillForm(this.userDetails);
    this.return = { url: ['/dashboard'], fragment: 'users' };
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
