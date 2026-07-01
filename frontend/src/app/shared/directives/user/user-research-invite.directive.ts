import { AfterViewInit, Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteResponse, UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { UserService } from '@core/services/user.service';

@Directive()
export class UserResearchInviteDirective implements OnInit, OnDestroy, AfterViewInit {
  public isExistingUser = false;
  public userDetails?: UserDetails;

  public caption: string = 'User account';
  public heading: string = 'Would you like to take part in our online user research sessions?';
  public detailsTitle: string = 'Why take part in our user research sessions?';
  public detailsTextOne: string =
    'The feedback you give us in online user research sessions allows us ' +
    'to improve the service and provide the sector with more useful tools.';
  public detailsTextTwo: string = 'Sessions last about an hour and are arranged for a time that suits you.';
  public userResearchInviteResponseOptions = Object.keys(InviteResponse);
  public showProgressBar = false;

  public userResearchInviteResponse: InviteResponse;
  public form: UntypedFormGroup;
  public submitted = false;
  public insideFlow: boolean;
  public confirmPagePath: string = '';

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected userService: UserService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.setupForm();
    this.loadUserResearchInviteResponse();
    this.setupUserSubscription();
    this.prefillForm();
    this.init();
    this.updateUiText();
  }

  protected init(): void {}
  protected loadUserResearchInviteResponse(): void {}

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      inviteResponse: [null, { updateOn: 'submit' }],
    });
  }

  protected updateUiText(): void {
    console.log('updateUiText');
    console.log('isExistingUser', this.isExistingUser);
    console.log('userDetails', this.userDetails);
    this.caption = this.isExistingUser && this.userDetails?.fullname ? this.userDetails.fullname : 'User account';

    this.heading = this.isExistingUser
      ? 'User research sessions'
      : 'Would you like to take part in our online user research sessions?';
  }

  protected setupUserSubscription(): void {
    this.userService.loggedInUser$.subscribe((user) => {
      this.userDetails = user;
    });
  }

  protected prefillForm(): void {
    if (this.userResearchInviteResponse === null) {
      return;
    }

    this.form.patchValue({ inviteResponse: this.userResearchInviteResponse });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
