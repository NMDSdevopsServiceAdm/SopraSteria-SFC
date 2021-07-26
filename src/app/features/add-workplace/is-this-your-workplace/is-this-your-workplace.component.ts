import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { IsThisYourWorkplaceDirective } from '@shared/directives/create-workplace/is-this-your-workplace/is-this-your-workplace.directive';

@Component({
  selector: 'app-is-this-your-workplace',
  templateUrl:
    '../../../shared/directives/create-workplace/is-this-your-workplace/is-this-your-workplace.component.html',
})
export class IsThisYourWorkplaceComponent extends IsThisYourWorkplaceDirective {
  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    protected formBuilder: FormBuilder,
  ) {
    super(errorSummaryService, establishmentService, backService, route, router, workplaceService, formBuilder);
  }
}
