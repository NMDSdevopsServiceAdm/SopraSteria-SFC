import { Directive, OnDestroy, OnInit } from '@angular/core';
import { EmployerType } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { BackService } from '@core/services/back.service';
import { WorkplaceUtil } from '@core/utils/workplace-util';
import { Subscription } from 'rxjs';

@Directive()
export class ConfirmWorkplaceDetailsDirective implements OnInit, OnDestroy {
  public flow: string;
  public locationAddress: LocationAddress;
  public workplace: Service;
  public workplaceNameAndAddress: SummaryList[];
  public mainService: SummaryList[];
  public typeOfEmployer: SummaryList[];
  public nameAndAddress: string;
  public WorkplaceTotalStaff: string;
  public employerType: string;
  public employerTypeObject: EmployerType;
  public totalStaff: SummaryList[];
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.init();
    this.setNameAndAddress();
    this.setTypeOfEmployer();
    this.setWorkplaceDetails();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected getWorkplaceData(): void {}

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
        route: { url: [this.flow, 'select-main-service'] },
      },
    ];

    this.totalStaff = [
      {
        label: 'Number of staff',
        data: this.WorkplaceTotalStaff,
        route: { url: [this.flow, 'add-total-staff'] },
      },
    ];

    this.typeOfEmployer = [
      {
        label: 'Employer type',
        data: this.employerType,
        route: { url: [this.flow, 'type-of-employer'] },
      },
    ];
  }

  protected setCqcRegulatedWithLocationIdWorkplaceDetails(): void {
    const confirmDetails = this.flow.includes('add-workplace') ? 'confirm-workplace-details' : 'confirm-details';

    this.workplaceNameAndAddress = [
      {
        label: 'CQC location ID',
        data: this.locationAddress.locationId,
        route: { url: [this.flow, confirmDetails, 'find-workplace'] },
      },
      {
        label: 'Name and address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setCqcRegulatedWithoutLocationIdWorkplaceDetails(): void {
    const confirmDetails = this.flow.includes('add-workplace') ? 'confirm-workplace-details' : 'confirm-details';

    this.workplaceNameAndAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: [this.flow, confirmDetails, 'find-workplace'] },
      },
      {
        label: 'Address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setNonCqcRegulatedWorkplaceDetails(): void {
    const confirmDetails = this.flow.includes('add-workplace') ? 'confirm-workplace-details' : 'confirm-details';

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

  public setTypeOfEmployer(): void {
    if (this.employerTypeObject.value === 'Other' && this.employerTypeObject.other) {
      this.employerType = this.employerTypeObject.other;
    } else {
      this.employerType = WorkplaceUtil.formatTypeOfEmployer(this.employerTypeObject.value);
    }
  }

  private convertWorkplaceAddressToString(workplaceAddress: Array<string>): string {
    return workplaceAddress.filter((x) => x).join('\r\n');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
