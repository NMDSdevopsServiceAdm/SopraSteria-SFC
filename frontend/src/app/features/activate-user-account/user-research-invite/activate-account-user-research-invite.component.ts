import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { UserResearchInviteDirective } from '@shared/directives/user/user-research-invite.directive';

@Component({
  selector: 'app-activate-account-user-research-invite',
  templateUrl: './../../../shared/directives/user/user-research-invite.directive.html',
  standalone: false,
})
export class ActivateAccountUserResearchInviteComponent extends UserResearchInviteDirective {
  private activationToken: string;
  public showProgressBar = false;

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    private createAccountService: CreateAccountService,
  ) {
    super(backLinkService, formBuilder, router, route);
  }

  init(): void {
    this.activationToken = this.route.snapshot.params.activationToken;
    this.insideFlow = this.route.parent.snapshot.url[0].path === this.activationToken;
    this.confirmPagePath = `/activate-account/${this.activationToken}/confirm-account-details`;
  }

  protected loadUserResearchInviteResponse(): void {
    this.userResearchInviteResponse = this.createAccountService.userResearchInviteResponse$.value;
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      const responseValueToSubmit = responseValue;

      this.createAccountService.userResearchInviteResponse$.next(responseValueToSubmit);
    }

    this.router.navigate([this.confirmPagePath]);
  }
}
