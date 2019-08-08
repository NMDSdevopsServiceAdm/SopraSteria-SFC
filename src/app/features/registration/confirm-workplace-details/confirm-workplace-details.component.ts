import { Component } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  ConfirmWorkplaceDetails,
} from '@features/workplace-find-and-select/confirm-workplace-details/confirm-workplace-details';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent extends ConfirmWorkplaceDetails {
  constructor(private registrationService: RegistrationService, protected backService: BackService) {
    super(backService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.getWorkplaceData();
  }

  protected getWorkplaceData(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        locationAddress => (this.locationAddress = locationAddress)
      )
    );

    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe(workplace => (this.workplace = workplace))
    );
  }
}
