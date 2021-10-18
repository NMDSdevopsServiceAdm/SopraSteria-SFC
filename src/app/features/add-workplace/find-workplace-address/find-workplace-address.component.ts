import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { FindWorkplaceAddressDirective } from '@shared/directives/create-workplace/find-workplace-address/find-workplace-address.directive';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/find-workplace-address/find-workplace-address.component.html',
})
export class FindWorkplaceAddressComponent extends FindWorkplaceAddressDirective {
  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    public workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, router, workplaceService);
  }

  protected setFlow(): void {
    this.flow = 'add-workplace';
  }
}
