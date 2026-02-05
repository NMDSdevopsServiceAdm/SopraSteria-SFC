import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-user-research-invite',
  templateUrl: './user-research-invite.component.html',
  styleUrl: './user-research-invite.component.scss',
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

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.setupForm();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      inviteResponse: [null, { updateOn: 'submit' }],
    });
  }

  public onSubmit(): void {
    const responseValue = this.form.value.inviteResponse;

    if (responseValue !== null) {
      this.registrationService.userResearchInviteResponse$.next(responseValue);
    }

    this.router.navigate(['registration/confirm-details']);
  }
}
