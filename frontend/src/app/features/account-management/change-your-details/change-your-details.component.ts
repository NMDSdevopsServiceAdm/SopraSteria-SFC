import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetailsDirective {
  public callToActionLabel = 'Save and return';
  public userDetails: UserDetails;
  private primaryWorkplace: Establishment;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: UntypedFormBuilder,
    protected router: Router,
    protected userService: UserService,
    protected route: ActivatedRoute,
  ) {
    super(backLinkService, errorSummaryService, fb, router, route);
  }

  protected init() {
    this.breadcrumbService.show(JourneyType.ACCOUNT);
    this.setupSubscriptions();
    this.return = { url: ['/account-management'] };
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe((user) => {
        this.userDetails = user;
        this.prefillForm(user);
      }),
    );
  }

  protected save(): void {
    const details = this.setUserDetails();
    this.userService.updateState(details);
    this.changeUserDetails(details);
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
        (error: HttpErrorResponse) => this.onError(error),
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
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }
}
