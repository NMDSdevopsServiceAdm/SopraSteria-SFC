import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  EnterWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/enter-workplace-address/enter-workplace-address';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../../shared/directives/create-workplace/enter-workplace-address/enter-workplace-address.component.html',
})
export class WorkplaceNameAddressComponent extends EnterWorkplaceAddressDirective {
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
    this.title = `What's your workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of your workplace';
    this.setupSubscription();
    this.setBackLink();
    this.registrationService.workplaceNotFound$.next(false);
  }

  protected setupSubscription(): void {
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

  protected setBackLink(): void {
    if (this.registrationService.workplaceNotFound$.value === true) {
      this.backService.setBackLink({ url: [`${this.flow}/new-workplace-not-found`] });
      return;
    }

    if (this.registrationService.isCqcRegulated$.value === true) {
      this.backService.setBackLink({ url: [`${this.flow}/select-workplace`] });
      return;
    }

    this.backService.setBackLink({ url: [`${this.flow}/select-workplace-address`] });
  }
}
