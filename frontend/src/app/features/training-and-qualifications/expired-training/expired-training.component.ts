import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';

import { ExpiredAndExpiringTrainingDirective } from '../expired-and-expiring-training/expired-and-expiring-training.directive';

@Component({
  selector: 'app-expired-training',
  templateUrl: '../expired-and-expiring-training/expired-and-expiring-training.component.html',
})
export class ExpiredTrainingComponent extends ExpiredAndExpiringTrainingDirective {
  constructor(
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected permissionsService: PermissionsService,
    protected trainingService: TrainingService,
    protected alertService: AlertService,
  ) {
    super(backLinkService, router, route, establishmentService, permissionsService, trainingService, alertService);
  }

  protected init(): void {
    this.title = 'Expired training records';
    this.flagText = 'Expired';
    this.img = '/assets/images/flag-red.svg';
    this.status = 'expired';
  }
}
