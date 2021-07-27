import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { FindYourWorkplaceDirective } from '@shared/directives/create-workplace/find-your-workplace/find-your-workplace.directive';

@Component({
  selector: 'app-find-your-workplace',
  templateUrl: '../../../shared/directives/create-workplace/find-your-workplace/find-your-workplace.component.html',
})
export class FindYourWorkplaceComponent extends FindYourWorkplaceDirective {
  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected locationService: LocationService,
  ) {
    super(router, backService, errorSummaryService, route, formBuilder, registrationService, locationService);
  }
}
