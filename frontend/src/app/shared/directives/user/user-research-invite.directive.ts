import { AfterViewInit, Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { InviteResponse, UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
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
    protected breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setupUserSubscription();
    this.loadUserResearchInviteResponse();
    this.init();
    this.prefillForm();
    this.setupNavigation();
    this.updatePageText();
  }

  protected init(): void {}
  protected loadUserResearchInviteResponse(): void {}

  protected setupNavigation(): void {
    if (this.isExistingUser) {
      this.breadcrumbService.show(JourneyType.ACCOUNT);
    } else {
      this.backLinkService.showBackLink();
    }
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      inviteResponse: [null, { updateOn: 'submit' }],
    });
  }

  protected updatePageText(): void {
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
