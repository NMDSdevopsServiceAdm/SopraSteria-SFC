import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/select-workplace-address/select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    public workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected setFlow(): void {
    this.flow = '/add-workplace';
  }

  protected setTitle(): void {
    this.title = 'Select the workplace address';
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select the workplace address if it's listed`;
  }

  protected navigateToConfirmDetails(): void {
    this.router.navigate([`${this.flow}/confirm-workplace-details`]);
  }
}
