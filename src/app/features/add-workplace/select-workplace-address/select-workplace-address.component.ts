import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  SelectWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    public workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService, workplaceService);
  }

  protected setFlow(): void {
    this.flow = '/add-workplace';
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select the workplace address if it's listed`;
  }

  protected navigateToConfirmDetails(): void {
    this.router.navigate([`${this.flow}/confirm-workplace-details`]);
  }
}
