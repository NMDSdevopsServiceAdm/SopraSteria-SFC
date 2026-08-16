import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  FindWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/find-workplace-address/find-workplace-address.directive';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/find-workplace-address/find-workplace-address.component.html',
  standalone: false,
})
export class FindWorkplaceAddressComponent extends FindWorkplaceAddressDirective {
  constructor(
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    public workplaceService: WorkplaceService,
  ) {
    super(backLinkService, errorSummaryService, formBuilder, locationService, router, workplaceService);
  }

  protected setFlow(): void {
    this.flow = 'add-workplace';
  }
}
