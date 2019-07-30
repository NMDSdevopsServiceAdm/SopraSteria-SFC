import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  SelectWorkplaceAddress,
} from '@features/workplace-find-and-select/select-workplace-address/select-workplace-address';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddress {
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.setupSubscriptions();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.workplaceService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      })
    );

    this.subscriptions.add(
      this.workplaceService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress)
      )
    );
  }

  public onLocationChange(index): void {
    this.workplaceService.selectedLocationAddress$.next(this.locationAddresses[index]);
  }
}
