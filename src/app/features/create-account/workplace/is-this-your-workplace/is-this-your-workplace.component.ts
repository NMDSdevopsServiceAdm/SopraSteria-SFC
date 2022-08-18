import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { IsThisYourWorkplaceDirective } from '@shared/directives/create-workplace/is-this-your-workplace/is-this-your-workplace.directive';

@Component({
  selector: 'app-is-this-your-workplace',
  templateUrl:
    '../../../../shared/directives/create-workplace/is-this-your-workplace/is-this-your-workplace.component.html',
})
export class IsThisYourWorkplaceComponent extends IsThisYourWorkplaceDirective {
  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
    public registrationService: RegistrationService,
    protected formBuilder: FormBuilder,
  ) {
    super(errorSummaryService, establishmentService, backService, route, router, registrationService, formBuilder);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'yourWorkplace',
        type: [
          {
            name: 'required',
            message: 'Select yes if this is your workplace',
          },
        ],
      },
    ];
  }
}
