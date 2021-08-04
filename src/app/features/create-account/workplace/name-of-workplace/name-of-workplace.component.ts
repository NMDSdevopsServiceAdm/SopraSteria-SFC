import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { NameOfWorkplaceDirective } from '@shared/directives/create-workplace/name-of-workplace/name-of-workplace.directive';

@Component({
  selector: 'app-name-of-workplace',
  templateUrl: '../../../../shared/directives/create-workplace/name-of-workplace/name-of-workplace.component.html',
})
export class NameOfWorkplaceComponent extends NameOfWorkplaceDirective {
  constructor(
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, backService, router, route, errorSummaryService, registrationService, establishmentService);
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceName',
        type: [{ name: 'required', message: 'Enter the name of your workplace' }],
      },
    ];
  }
}
