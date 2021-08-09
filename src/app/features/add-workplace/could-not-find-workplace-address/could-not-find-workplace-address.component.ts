import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { CouldNotFindWorkplaceAddressDirective } from '@shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.directive';

@Component({
  selector: 'app-could-not-find-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.component.html',
})
export class CouldNotFindWorkplaceAddressComponent extends CouldNotFindWorkplaceAddressDirective {
  constructor(
    protected workplaceService: WorkplaceService,
    public backService: BackService,
    protected establishmentService: EstablishmentService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(workplaceService, backService, establishmentService, formBuilder, errorSummaryService, router, route);
  }
}
