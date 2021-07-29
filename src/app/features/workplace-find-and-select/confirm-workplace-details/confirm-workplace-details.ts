import { Directive, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { BackService } from '@core/services/back.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Directive()
export class ConfirmWorkplaceDetails implements OnInit, OnDestroy {
  public flow: string;
  public locationAddress: LocationAddress;
  public workplace: Service;
  public createAccountNewDesign: boolean;
  public workplaceName: SummaryList[];
  public workplaceAddress: SummaryList[];
  public mainService: SummaryList[];
  protected address: string;
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService, protected featureFlagsService: FeatureFlagsService) {}

  async ngOnInit(): Promise<void> {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
    this.init();
    this.setAddress();
    this.setWorkplaceDetails();
    this.setBackLink();
  }

  protected init(): void {}

  protected getWorkplaceData(): void {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-main-service`] });
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

  protected setCqcLocationIdWorkplaceDetails(): void {
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

  protected setCqcWorkplaceDetails(): void {
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

  protected setNonCqcWorkplaceDetails(): void {
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

  protected setAddress(): void {
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
