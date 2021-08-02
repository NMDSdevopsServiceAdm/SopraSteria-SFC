import { Directive, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { BackService } from '@core/services/back.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Directive()
export class ConfirmWorkplaceDetailsDirective implements OnInit, OnDestroy {
  public flow: string;
  public locationAddress: LocationAddress;
  public workplace: Service;
  public createAccountNewDesign: boolean;
  public workplaceNameAndAddress: SummaryList[];
  public mainService: SummaryList[];
  public nameAndAddress: string;
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService, protected featureFlagsService: FeatureFlagsService) {}

  ngOnInit(): void {
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
    });
    this.init();
    this.setNameAndAddress();
    this.setWorkplaceDetails();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected getWorkplaceData(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setBackLink(): void {}

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
        data: this.nameAndAddress,
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
        data: this.nameAndAddress,
      },
    ];
  }

  public setNameAndAddress(): void {
    const workplaceAddress = [
      this.locationAddress.addressLine1,
      this.locationAddress.addressLine2,
      this.locationAddress.addressLine3,
      this.locationAddress.townCity,
      this.locationAddress.county,
      this.locationAddress.postalCode,
    ];
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      workplaceAddress.unshift(this.locationAddress.locationName);
    }

    this.nameAndAddress = this.convertWorkplaceAddressToString(workplaceAddress);
  }

  private convertWorkplaceAddressToString(workplaceAddress: Array<string>): string {
    return workplaceAddress.filter((x) => x).join('<br>');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
