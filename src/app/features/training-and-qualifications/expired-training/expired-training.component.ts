import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-expired-training',
  templateUrl: './expired-training.component.html',
})
export class ExpiredTrainingComponent implements OnInit {
  public title = 'Expired training records';
  public expiredTraining: any[];
  public workplaceUid: string;
  public canEditWorker: boolean;
  public primaryWorkplaceUid: string;

  constructor(
    private backLinkService: BackLinkService,
    private router: Router,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.expiredTraining = this.route.snapshot.data.expiredTraining.training;
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.backLinkService.showBackLink();
  }

  public returnToHome(): void {
    console.log(this.workplaceUid);
    console.log(this.primaryWorkplaceUid);
    const returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }
}
