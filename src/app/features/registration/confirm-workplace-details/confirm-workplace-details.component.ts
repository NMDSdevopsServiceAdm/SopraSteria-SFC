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
  public createAccountNewDesign: boolean;
  public workplaceName: SummaryList[];
  public workplaceAddress: SummaryList[];
  public mainService: SummaryList[];
  private address: string;

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
    this.getWorkplaceData();
    this.setAddress();
    this.setWorkplaceDetails();
  }

  protected getWorkplaceData(): void {
    this.locationAddress = this.registrationService.selectedLocationAddress$.value;
    this.workplace = this.registrationService.selectedWorkplaceService$.value;
  }

  private setWorkplaceDetails(): void {
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      this.setCqcLocationIdWorkplaceDetails();
    }
    // this.workplaceAddress = [
    //   {
    //     label: 'Full name',
    //     data: this.locationAddress.fullname,
    //     route: { url: ['/registration/change-your-details'] },
    //   },
    //   {
    //     label: 'Job title',
    //     data: this.locationAddress.jobTitle,
    //   },
    //   {
    //     label: 'Email address',
    //     data: this.locationAddress.email,
    //   },
    //   {
    //     label: 'Phone number',
    //     data: this.locationAddress.phone,
    //   },
    // ];
    // this.mainService = [
    //   {
    //     label: 'Security question',
    //     data: this.securityDetails.securityQuestion,
    //     route: { url: ['/registration/create-security-question'] },
    //   },
    //   {
    //     label: 'Security answer',
    //     data: this.securityDetails.securityQuestionAnswer,
    //   },
    // ];
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

  private setAddress(): void {
    this.address = `
    ${this.locationAddress.addressLine1}
    ${this.locationAddress.addressLine2}
    ${this.locationAddress.addressLine3}
    ${this.locationAddress.townCity}
    ${this.locationAddress.county} ${this.locationAddress.postalCode}`;
  }
}
