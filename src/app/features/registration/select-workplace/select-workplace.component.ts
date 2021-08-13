import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SelectWorkplaceDirective } from '@features/workplace-find-and-select/select-workplace/select-workplace.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplaceDirective {
  constructor(
    public registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService, registrationService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.setupSubscription();
    this.prefillForm();
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.registrationService.locationAddresses$.subscribe(
        (locationAddresses: Array<LocationAddress>) => (this.locationAddresses = locationAddresses),
      ),
    );
  }

  protected save(): void {
    this.registrationService.manuallyEnteredWorkplace$.next(false);
    this.registrationService.selectedLocationAddress$.next(this.getSelectedLocation());
    this.router.navigate([this.flow, this.nextRoute]);
  }

  public prefillForm() {
    if (this.registrationService.selectedLocationAddress$.value) {
      this.form.patchValue({
        workplace: this.registrationService.selectedLocationAddress$.value.locationId,
      });
    }
  }
}
