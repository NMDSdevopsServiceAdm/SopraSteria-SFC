import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { FindWorkplaceAddress } from '@features/workplace-find-and-select/find-workplace-address/find-workplace-address';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl: './find-workplace-address.component.html',
})
export class FindWorkplaceAddressComponent extends FindWorkplaceAddress {
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, router);
  }

  protected init(): void {
    this.flow = '/add-workplace';
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.workplaceService.locationAddresses$.next(data.postcodedata);
  }
}
