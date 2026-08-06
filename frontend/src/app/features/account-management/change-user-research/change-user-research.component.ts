import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { UserResearchInviteDirective } from '@shared/directives/user/user-research-invite.directive';

@Component({
  selector: 'app-change-user-research',
  templateUrl: '../../../shared/directives/user/user-research-invite.directive.html',
  standalone: false,
})
export class ChangeUserResearchComponent extends UserResearchInviteDirective {
  public showProgressBar = false;
  private primaryWorkplace: Establishment;
  public user: UserDetails;

  constructor(
    private establishmentService: EstablishmentService,
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected userService: UserService,
    private createAccountService: CreateAccountService,
    protected breadcrumbService: BreadcrumbService,
  ) {
    super(backLinkService, formBuilder, router, route, userService, breadcrumbService);
  }

  init(): void {
    this.isExistingUser = true;
    this.insideFlow = false;
    this.showProgressBar = false;

    this.confirmPagePath = '/account-management';
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
  }

  protected loadUserResearchInviteResponse(): void {
    this.userResearchInviteResponse = this.userDetails?.userResearchInviteResponse ?? null;
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;
    this.createAccountService.userResearchInviteResponse$.next(responseValue);
    if (responseValue !== null) {
      const updatedUser: UserDetails = {
        ...this.userDetails,
        userResearchInviteResponse: responseValue,
      };

      this.userService
        .updateUserDetails(this.primaryWorkplace.uid, this.userDetails.uid, updatedUser)
        .subscribe((data) => {
          this.userService.loggedInUser = {
            ...this.userDetails,
            ...data,
          };
        });
    }
    this.router.navigate(['/account-management']);
  }
}
