import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  WorkplaceNameAddressDirective,
} from '@shared/directives/create-workplace/workplace-name-address/workplace-name-address';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../shared/directives/create-workplace/workplace-name-address/workplace-name-address.component.html',
})
export class WorkplaceNameAddressComponent extends WorkplaceNameAddressDirective {
  public isCqcRegulated: boolean;
  public createAccountNewDesign: boolean;

  constructor(
    private featureFlagsService: FeatureFlagsService,
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = '/add-workplace';
    this.title = `What's the workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of the workplace';
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.returnToWorkplaceNotFound = this.workplaceService.workplaceNotFound$.value;
    this.manuallyEnteredWorkplace = this.workplaceService.manuallyEnteredWorkplace$.value;
    this.isCqcRegulated = this.workplaceService.isCqcRegulated$.value;

    await this.setFeatureFlag();
    this.setupPreFillForm();
    this.setBackLink();
  }

  private async setFeatureFlag() {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  public setupPreFillForm(): void {
    const selectedLocation = this.workplaceService.selectedLocationAddress$.value;
    if (this.createAccountNewDesign) {
      if (this.manuallyEnteredWorkplace || this.returnToConfirmDetails) {
        this.preFillForm(selectedLocation);
      }
    }
    if (!this.createAccountNewDesign && selectedLocation) {
      this.preFillForm(selectedLocation);
    }
  }

  protected setSelectedLocationAddress(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getLocationAddress());
    this.workplaceService.manuallyEnteredWorkplace$.next(true);
    const url = this.getNextRoute();
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow, 'confirm-workplace-details'] });
      return;
    }

    if (this.createAccountNewDesign) {
      if (this.isCqcRegulatedAndWorkplaceNotFound()) {
        this.backService.setBackLink({ url: [this.flow, 'new-workplace-not-found'] });
        this.workplaceService.workplaceNotFound$.next(false);
        return;
      }
      if (this.isNotCqcRegulatedAndWorkplaceNotFound()) {
        this.backService.setBackLink({ url: [this.flow, 'workplace-address-not-found'] });
        this.workplaceService.workplaceNotFound$.next(false);
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
      return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'new-select-main-service';
    }
    return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'select-main-service';
  }

  private isCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.workplaceService.workplaceNotFound$.value && this.isCqcRegulated;
  }

  private isNotCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.workplaceService.workplaceNotFound$.value && !this.isCqcRegulated;
  }
}
