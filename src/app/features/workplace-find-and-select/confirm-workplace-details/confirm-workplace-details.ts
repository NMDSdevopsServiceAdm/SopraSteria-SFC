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
  public workplaceNameAndAddress: SummaryList[];
  public mainService: SummaryList[];
  protected address: string;
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService, protected featureFlagsService: FeatureFlagsService) {}

  ngOnInit(): void {
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
    });
    this.init();
    this.setAddress();
    this.setWorkplaceDetails();
  }

  protected init(): void {}

  protected getWorkplaceData(): void {}

  public setWorkplaceDetails(): void {
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      this.setCqcLocationIdWorkplaceDetails();
    } else {
      this.setNonLocationIdWorkplaceDetails();
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
    this.workplaceNameAndAddress = [
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

  protected setNonLocationIdWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
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

  protected setAddress(): void {
    this.address = [
      this.locationAddress.addressLine1,
      this.locationAddress.addressLine2,
      this.locationAddress.addressLine3,
      this.locationAddress.townCity,
      this.locationAddress.county,
      this.locationAddress.postalCode,
    ].join('\n');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
