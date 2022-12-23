/* eslint-disable @typescript-eslint/no-empty-function */
import { Directive, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Directive()
export class ExpiredAndExpiringTrainingDirective implements OnInit {
  public title: string;
  public trainingList: any[];
  public workplaceUid: string;
  public canEditWorker: boolean;
  public primaryWorkplaceUid: string;

  constructor(
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.init();
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.backLinkService.showBackLink();
  }

  protected init(): void {}

  public returnToHome(): void {
    const returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }
}
