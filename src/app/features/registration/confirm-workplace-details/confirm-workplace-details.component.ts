import { Component } from '@angular/core';
import { SummaryList } from '@core/model/summary-list.model';
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
  public workplaceName: SummaryList[];
  public workplaceAddress: SummaryList[];
  public mainService: SummaryList[];
  private address: string;

  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, featureFlagsService);
  }

  protected async init(): Promise<void> {
    this.flow = '/registration';
    this.getWorkplaceData();
    this.setAddress();
    this.setWorkplaceDetails();
  }

  protected getWorkplaceData(): void {
    this.locationAddress = this.registrationService.selectedLocationAddress$.value;
    this.workplace = this.registrationService.selectedWorkplaceService$.value;
  }

  public setWorkplaceDetails(): void {
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      this.setCqcLocationIdWorkplaceDetails();
    }
    if (this.workplace.isCQC && !this.locationAddress.locationId) {
      this.setCqcWorkplaceDetails();
    }
    if (!this.workplace.isCQC) {
      this.setNonCqcWorkplaceDetails();
    }
    this.mainService = [
      {
        label: 'Main service',
        data: this.workplace.name,
        route: { url: ['/'] },
      },
    ];
  }

  private setCqcLocationIdWorkplaceDetails(): void {
    this.workplaceAddress = [
      {
        label: 'CQC location ID',
        data: this.locationAddress.locationId,
        route: { url: ['/'] },
      },
      {
        label: 'Name and address',
        data: `${this.locationAddress.locationName}
        ${this.address}`,
      },
    ];
  }

  private setCqcWorkplaceDetails(): void {
    this.workplaceAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: ['/'] },
      },
      {
        label: 'Address',
        data: this.address,
      },
    ];
  }

  private setNonCqcWorkplaceDetails(): void {
    this.workplaceName = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: ['/'] },
      },
    ];
    this.workplaceAddress = [
      {
        label: 'Address',
        data: this.address,
        route: { url: ['/'] },
      },
    ];
  }

  private setAddress(): void {
    this.address = [
      this.locationAddress.addressLine1,
      this.locationAddress.addressLine2,
      this.locationAddress.addressLine3,
      this.locationAddress.townCity,
      this.locationAddress.county,
      this.locationAddress.postalCode,
    ].join('\n');
    console.log(this.address);

    // this.address = `
    // ${this.locationAddress.addressLine1}\n
    // ${this.locationAddress.addressLine2}\n
    // ${this.locationAddress.addressLine3}\n
    // ${this.locationAddress.townCity}\n
    // ${this.locationAddress.county}\n
    // ${this.locationAddress.postalCode}`;
  }
}
