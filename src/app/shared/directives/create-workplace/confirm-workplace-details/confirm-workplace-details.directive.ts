/* eslint-disable @typescript-eslint/no-empty-function */
import { Directive, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { BackService } from '@core/services/back.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
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

  constructor(
    protected backService: BackService,
    protected featureFlagsService: FeatureFlagsService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  ngOnInit(): void {
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
    });
    this.setFlow();
    this.resetReturnTo();
    this.getWorkplaceData();
    this.setNameAndAddress();
    this.setWorkplaceDetails();
  }

  protected setFlow(): void {}

  public setBackLink(): void {}

  protected getWorkplaceData(): void {
    this.locationAddress = this.workplaceInterfaceService.selectedLocationAddress$.value;
    this.workplace = this.workplaceInterfaceService.selectedWorkplaceService$.value;
  }

  public setWorkplaceDetails(): void {
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      this.setCqcRegulatedWithLocationIdWorkplaceDetails();
    }
    if (this.workplace.isCQC && !this.locationAddress.locationId) {
      this.setCqcRegulatedWithoutLocationIdWorkplaceDetails();
    }
    if (!this.workplace.isCQC) {
      this.setNonCqcRegulatedWorkplaceDetails();
    }

    this.mainService = [
      {
        label: 'Main service',
        data: this.workplace.name,
        route: { url: [this.flow, 'new-select-main-service'] },
      },
    ];
  }

  protected setCqcRegulatedWithLocationIdWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'CQC location ID',
        data: this.locationAddress.locationId,
        route: { url: [this.flow, 'find-workplace'] },
      },
      {
        label: 'Name and address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setCqcRegulatedWithoutLocationIdWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: [this.flow, 'find-workplace'] },
      },
      {
        label: 'Address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setNonCqcRegulatedWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: [this.flow, 'workplace-name-address'] },
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

  protected resetReturnTo(): void {
    this.workplaceInterfaceService.returnTo$.next(null);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
