import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
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
    protected backLinkService: BackLinkService,
    protected route: ActivatedRoute,
    protected router: Router,
    public workplaceService: WorkplaceService,
    protected formBuilder: FormBuilder,
  ) {
    super(
      errorSummaryService,
      establishmentService,
      backService,
      backLinkService,
      route,
      router,
      workplaceService,
      formBuilder,
    );
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'yourWorkplace',
        type: [
          {
            name: 'required',
            message: 'Select yes if this is the workplace you want to add',
          },
        ],
      },
    ];
  }
}
