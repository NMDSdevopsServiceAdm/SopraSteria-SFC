import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.workplaceService.manuallyEnteredWorkplace$.next(false);
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.setupSubscriptions();
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'address',
        type: [
          {
            name: 'required',
            message: `Select the workplace address if it's listed`,
          },
        ],
      },
    ];
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      this.workplaceService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      }),
    );

    this.subscriptions.add(
      this.workplaceService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress),
      ),
    );
  }

  public onLocationChange(index): void {
    this.workplaceService.selectedLocationAddress$.next(this.locationAddresses[index]);
  }

  protected getNextRoute(): string {
    if (this.returnToConfirmDetails) {
      return 'confirm-workplace-details';
    }
    if (this.createAccountNewDesign) {
      return 'new-select-main-service';
    }
    if (this.selectedLocationAddress.locationName.length) {
      return 'select-main-service';
    }
    return 'workplace-name-address';
  }
}
