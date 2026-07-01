import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { UserService } from '@core/services/user.service';
import { UserResearchInviteDirective } from '@shared/directives/user/user-research-invite.directive';

@Component({
  selector: 'app-change-user-research',
  templateUrl: '../../../shared/directives/user/user-research-invite.directive.html',
  standalone: false,
})
export class ChangeUserResearchComponent extends UserResearchInviteDirective {
  public showProgressBar = false;

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected userService: UserService,
    private createAccountService: CreateAccountService,
  ) {
    super(backLinkService, formBuilder, router, route, userService);
  }

  init(): void {
    this.isExistingUser = true;
    this.userService.loggedInUser$.subscribe((user) => {
      this.userDetails = user;
    });
    this.insideFlow = false;
    this.showProgressBar = false;

    this.confirmPagePath = '/account-management';
  }

  protected loadUserResearchInviteResponse(): void {
    this.userResearchInviteResponse = this.createAccountService.userResearchInviteResponse$.value;
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      this.createAccountService.userResearchInviteResponse$.next(responseValue);
    }

    this.router.navigate(['/account-management']);
  }
}
