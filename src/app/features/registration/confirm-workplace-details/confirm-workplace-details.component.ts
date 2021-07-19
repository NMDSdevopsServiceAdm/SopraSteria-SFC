import { Component } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  ConfirmWorkplaceDetails,
} from '@features/workplace-find-and-select/confirm-workplace-details/confirm-workplace-details';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
})
export class ConfirmWorkplaceDetailsComponent extends ConfirmWorkplaceDetails {
  public createAccountNewDesign: boolean;

  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    private featureFlagsService: FeatureFlagsService,
  ) {
    super(backService);
  }

  protected async init(): Promise<void> {
    this.flow = '/registration';
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
    console.log('Feature flag: ' + this.createAccountNewDesign);
    this.getWorkplaceData();
  }

  protected getWorkplaceData(): void {
    if (this.createAccountNewDesign) {
      this.subscriptions.add(
        this.registrationService.locationAddresses$.subscribe(
          (locationAddress) => (this.locationAddress = locationAddress[0]),
        ),
      );
      console.log(this.locationAddress);
    } else {
      this.subscriptions.add(
        this.registrationService.selectedLocationAddress$.subscribe(
          (locationAddress) => (this.locationAddress = locationAddress),
        ),
      );
    }
    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe((workplace) => (this.workplace = workplace)),
    );
  }
}
