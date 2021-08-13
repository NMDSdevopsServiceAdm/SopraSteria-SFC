import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  WorkplaceNameAddressDirective,
} from '@shared/directives/create-workplace/workplace-name-address/workplace-name-address';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../../shared/directives/create-workplace/workplace-name-address/workplace-name-address.component.html',
})
export class WorkplaceNameAddressComponent extends WorkplaceNameAddressDirective {
  public isCqcRegulated: boolean;
  public createAccountNewDesign: boolean;

  constructor(
    public registrationService: RegistrationService,
    private featureFlagsService: FeatureFlagsService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router);
  }

  protected async init(): Promise<void> {
    this.flow = '/registration';
    this.title = `What's your workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of your workplace';
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.returnToWorkplaceNotFound = this.registrationService.workplaceNotFound$.value;
    this.manuallyEnteredWorkplace = this.registrationService.manuallyEnteredWorkplace$.value;
    this.isCqcRegulated = this.registrationService.isCqcRegulated$.value;

    this.setupPreFillForm();
    await this.setFeatureFlag();
    this.setBackLink();
  }

  private async setFeatureFlag() {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  private setupPreFillForm(): void {
    const selectedLocation = this.registrationService.selectedLocationAddress$.value;
    if (this.manuallyEnteredWorkplace || this.returnToConfirmDetails) {
      this.preFillForm(selectedLocation);
    }
  }

  protected setSelectedLocationAddress(): void {
    this.registrationService.selectedLocationAddress$.next(this.getLocationAddress());
    this.registrationService.manuallyEnteredWorkplace$.next(true);
    const url = this.getNextRoute();
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow, 'confirm-details'] });
      return;
    }

    if (this.createAccountNewDesign) {
      if (this.isCqcRegulatedAndWorkplaceNotFound()) {
        this.backService.setBackLink({ url: [this.flow, 'new-workplace-not-found'] });
        return;
      }
      if (this.isNotCqcRegulatedAndWorkplaceNotFound()) {
        this.backService.setBackLink({ url: [this.flow, 'workplace-address-not-found'] });
        return;
      }
    }

    if (this.isCqcRegulated) {
      this.backService.setBackLink({ url: [this.flow, 'select-workplace'] });
      return;
    }

    this.backService.setBackLink({ url: [this.flow, 'select-workplace-address'] });
  }

  protected getNextRoute(): string {
    if (this.createAccountNewDesign) {
      return this.returnToConfirmDetails ? 'confirm-details' : 'new-select-main-service';
    }
    return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'select-main-service';
  }

  private isCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.registrationService.workplaceNotFound$.value && this.isCqcRegulated;
  }

  private isNotCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.registrationService.workplaceNotFound$.value && !this.isCqcRegulated;
  }
}
