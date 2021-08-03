import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.registrationService.manuallyEnteredWorkplace$.next(false);
    this.setupSubscriptions();
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'address',
        type: [
          {
            name: 'required',
            message: `Select your workplace address if it's listed`,
          },
        ],
      },
    ];
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      }),
    );

    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress),
      ),
    );
  }

  public onLocationChange(index): void {
    this.registrationService.selectedLocationAddress$.next(this.locationAddresses[index]);
  }
}
