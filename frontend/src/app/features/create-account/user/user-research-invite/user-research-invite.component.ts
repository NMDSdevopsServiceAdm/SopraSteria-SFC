import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { UserResearchInviteDirective } from '@shared/directives/user/user-research-invite.directive';

@Component({
  selector: 'app-user-research-invite',
  templateUrl: './../../../../shared/directives/user/user-research-invite.directive.html',
  standalone: false,
})
export class UserResearchInviteComponent extends UserResearchInviteDirective {
  public confirmPagePath: string = 'registration/confirm-details';
  public workplaceSections: string[];
  public userAccountSections: string[];

  public insideFlow = false;
  public showProgressBar = false;

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    private registrationService: RegistrationService,
    protected userService: UserService,
    protected breadcrumbService: BreadcrumbService,
  ) {
    super(backLinkService, formBuilder, router, route, userService, breadcrumbService);
  }

  init(): void {
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.showProgressBar = this.insideFlow;
    this.isExistingUser = false;
  }

  protected loadUserResearchInviteResponse(): void {
    this.userResearchInviteResponse = this.registrationService.userResearchInviteResponse$.value;
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      const responseValueToSubmit = responseValue;

      this.registrationService.userResearchInviteResponse$.next(responseValueToSubmit);
    }

    this.router.navigate(['registration/confirm-details']);
  }
}
