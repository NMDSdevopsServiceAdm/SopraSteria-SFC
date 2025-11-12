import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Component({
    selector: 'app-parent-workplace-accounts',
    templateUrl: './parent-workplace-accounts.component.html',
    standalone: false
})
export class ParentWorkplaceAccounts implements OnInit {
  public insideFlow: boolean;
  public flow: string;
  public returnToConfirmDetails: boolean;
  public submitted: boolean;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected backService: BackService,
    public backLinkService: BackLinkService,
    public registrationService: RegistrationsService,
    protected router: Router,
    private route: ActivatedRoute,
    protected workplaceService: WorkplaceService,
    protected workplaceInterfaceService: WorkplaceService,
  ) {}

  ngOnInit(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.returnToConfirmDetails = this.workplaceInterfaceService.headOfficeServices$.value;
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();

    this.setBackLink();
  }
  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected onClick(): void {
    this.workplaceInterfaceService.headOfficeServices$.next(true);
    this.navigateToNextPage();
  }

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'add-total-staff'];
    this.router.navigate(url);
  }
}
