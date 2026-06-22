import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { InviteResponse } from '@core/model/userDetails.model';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { UserResearchInviteDirective } from '@shared/directives/user/user-research-invite.directive';

@Component({
  selector: 'app-user-research-invite',
  templateUrl: './user-research-invite.component.html',
  standalone: false,
})
export class UserResearchInviteComponent extends UserResearchInviteDirective {
  public detailsTitle: string = 'Why take part in our user research sessions?';
  public detailsTextOne: string =
    'The feedback you give us in online user research sessions allows us ' +
    'to improve the service and provide the sector with more useful tools.';
  public detailsTextTwo: string = 'Sessions last about an hour and are arranged for a time that suits you.';
  public form: UntypedFormGroup;
  public submitted = false;
  public insideFlow: boolean;
  public confirmPagePath: string = 'registration/confirm-details';
  public userResearchInviteResponse: InviteResponse;
  public workplaceSections: string[];
  public userAccountSections: string[];
  public userResearchInviteResponseOptions = Object.keys(InviteResponse);

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    private registrationService: RegistrationService,
  ) {
    super(backLinkService, formBuilder, router, route);
  }

  ngOnInit(): void {
    this.setBackLink();
    this.setupForm();
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.userResearchInviteResponse = this.registrationService.userResearchInviteResponse$.value;
    this.preFillForm();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      const responseValueToSubmit = responseValue;

      this.registrationService.userResearchInviteResponse$.next(responseValueToSubmit);
    }

    this.router.navigate(['registration/confirm-details']);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      inviteResponse: [null, { updateOn: 'submit' }],
    });
  }

  private preFillForm(): void {
    if (this.userResearchInviteResponse === null) {
      return;
    }

    this.form.patchValue({ inviteResponse: this.userResearchInviteResponse });
  }
}
