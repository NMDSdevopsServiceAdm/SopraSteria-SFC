import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { SecurityDetails } from '@core/model/security-details.model';

@Component({
  selector: 'app-user-research-invite',
  templateUrl: './user-research-invite.component.html',
  standalone: false,
})
export class UserResearchInviteComponent {
  public detailsTitle: string = 'Why take part in our user research sessions?';
  public detailsTextOne: string =
    'The feedback you give us in online user research sessions allows us ' +
    'to improve the service and provide the sector with more useful tools.';
  public detailsTextTwo: string =
    'Sessions last about an hour and are arranged for a time that suits you.';
  public form: UntypedFormGroup;
  public submitted = false;
  public insideFlow: boolean;
  public confirmPagePath: string = 'registration/confirm-details';
  public userResearchInviteResponse: boolean;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.setupForm();
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.userResearchInviteResponse = this.registrationService.userResearchInviteResponse$.value
    this.preFillForm();
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      this.registrationService.userResearchInviteResponse$.next(responseValue === 'yes');
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

    if (this.userResearchInviteResponse) {
      this.form.get('inviteResponse').setValue('yes');
    } else {
      this.form.get('inviteResponse').setValue('no');
    }
  }
}
