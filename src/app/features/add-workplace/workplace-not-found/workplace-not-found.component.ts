import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { WorkplaceNotFoundDirective } from '@shared/directives/create-workplace/workplace-not-found/workplace-not-found.directive';

@Component({
  selector: 'app-workplace-not-found',
  templateUrl: '../../../shared/directives/create-workplace/workplace-not-found/workplace-not-found.component.html',
})
export class WorkplaceNotFoundComponent extends WorkplaceNotFoundDirective {
  constructor(
    protected establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workplaceService: WorkplaceService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(establishmentService, formBuilder, backService, errorSummaryService, workplaceService, router, route);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
    this.isParent = true;
  }
}
