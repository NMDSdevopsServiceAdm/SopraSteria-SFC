import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { WorkplaceNotFound } from '@features/workplace-find-and-select/workplace-not-found/workplace-not-found';

@Component({
  selector: 'app-workplace-not-found',
  templateUrl: './workplace-not-found.component.html',
})
export class WorkplaceNotFoundComponent extends WorkplaceNotFound {
  constructor(
    private workplaceService: WorkplaceService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected locationService: LocationService,
    protected router: Router,
    protected backService: BackService,
  ) {
    super(formBuilder, backService, errorSummaryService, locationService, router);
  }

  protected init(): void {
    this.flow = '/add-workplace';
  }

  public onSuccess(data: LocationSearchResponse) {
    this.workplaceService.locationAddresses$.next(data.postcodedata);
    this.navigateToSelectWorkplaceAddressRoute();
  }
}
