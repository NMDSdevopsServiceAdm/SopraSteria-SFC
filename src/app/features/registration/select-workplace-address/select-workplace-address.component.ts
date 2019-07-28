import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SelectWorkplaceAddress } from '@features/workplace-find-and-select/select-workplace-address/select-workplace-address';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddress {
  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.flow = '/registration';
    this.setupSubscriptions();
    this.setBackLink();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      })
    );

    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress)
      )
    );
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/regulated-by-cqc'] });
  }

  public onLocationChange(addressLine1: string): void {
    this.registrationService.selectedLocationAddress$.next(this.getSelectedLocation(addressLine1));
  }

  protected navigateToNextRoute(locationName: string): void {
    if (!locationName.length) {
      this.router.navigate(['/registration/enter-workplace-address']);
    } else {
      this.router.navigate(['/registration/select-main-service']);
    }
  }
}
