import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { EnterWorkplaceAddress } from '@features/workplace-find-and-select/enter-workplace-address/enter-workplace-address';

@Component({
  selector: 'app-enter-workplace-address',
  templateUrl: './enter-workplace-address.component.html',
})
export class EnterWorkplaceAddressComponent extends EnterWorkplaceAddress {
  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router);
  }

  protected init(): void {
    this.flow = '/registration';
    this.setupSubscription();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe((selectedLocation: LocationAddress) => {
        if (selectedLocation) {
          this.preFillForm(selectedLocation);
        }
      }),
    );
  }

  protected setSelectedLocationAddress(): void {
    this.registrationService.selectedLocationAddress$.next(this.getLocationAddress());
    this.registrationService.manuallyEnteredWorkplace$.next(true);
    this.router.navigate([`${this.flow}/select-main-service`]);
  }
}
