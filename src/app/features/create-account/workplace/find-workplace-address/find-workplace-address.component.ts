import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { FindWorkplaceAddressDirective } from '@shared/directives/create-workplace/find-workplace-address/find-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl:
    '../../../../shared/directives/create-workplace/find-workplace-address/find-workplace-address.component.html',
})
export class FindWorkplaceAddressComponent extends FindWorkplaceAddressDirective {
  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    public registrationService: RegistrationService,
  ) {
    super(
      backService,
      errorSummaryService,
      formBuilder,
      locationService,
      router,
      featureFlagsService,
      registrationService,
    );
  }

  protected setFlow(): void {
    this.flow = 'registration';
  }
}
