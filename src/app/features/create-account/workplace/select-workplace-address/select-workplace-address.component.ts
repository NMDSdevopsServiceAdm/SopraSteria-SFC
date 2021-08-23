import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  SelectWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl:
    '../../../../shared/directives/create-workplace/select-workplace-address/select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    public registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService, registrationService);
  }

  protected setFlow(): void {
    this.flow = '/registration';
  }

  protected setTitle(): void {
    this.title = 'Select your workplace address';
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select your workplace address if it's listed`;
  }

  protected navigateToConfirmDetails(): void {
    this.router.navigate([`${this.flow}/confirm-details`]);
  }
}
