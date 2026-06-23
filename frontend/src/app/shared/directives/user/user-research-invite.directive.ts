import { AfterViewInit, Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteResponse } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';

@Directive()
export class UserResearchInviteDirective implements OnInit, OnDestroy, AfterViewInit {
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
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.setupForm();
    this.loadUserResearchInviteResponse();
    this.prefillForm();
    this.init();
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

  protected prefillForm(): void {
    if (this.userResearchInviteResponse === null) {
      return;
    }

    this.form.patchValue({ inviteResponse: this.userResearchInviteResponse });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
