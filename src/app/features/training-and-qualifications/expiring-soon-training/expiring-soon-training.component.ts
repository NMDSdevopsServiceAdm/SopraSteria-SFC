import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';

import { ExpiredAndExpiringTrainingDirective } from '../expired-and-expiring-training/expired-and-expiring-training.directive';

@Component({
  selector: 'app-expiring-soon-training',
  templateUrl: '../expired-and-expiring-training/expired-and-expiring-training.component.html',
})
export class ExpiringSoonTrainingComponent extends ExpiredAndExpiringTrainingDirective {
  constructor(
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected permissionsService: PermissionsService,
    protected trainingService: TrainingService,
  ) {
    super(backLinkService, router, route, establishmentService, permissionsService, trainingService);
  }

  protected init(): void {
    this.title = 'Records that expire soon';
    this.flagText = 'Expires soon';
    this.img = '/assets/images/flag-orange.svg';
    this.status = 'expiring';
  }
}
