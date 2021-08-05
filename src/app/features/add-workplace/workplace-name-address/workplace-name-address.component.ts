import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
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
  constructor(
    private featureFlagsService: FeatureFlagsService,
    private workplaceService: WorkplaceService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router);
  }

  protected async init(): Promise<void> {
    this.flow = '/add-workplace';
    this.title = `What's the workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of the workplace';
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.returnToWorkplaceNotFound = this.workplaceService.workplaceNotFound$.value;
    this.isCqcRegulated = this.workplaceService.isCqcRegulated$.value;

    await this.setFeatureFlag();
    this.setBackLink();
    this.setupSubscription();
  }

  private async setFeatureFlag() {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.workplaceService.selectedLocationAddress$.subscribe((selectedLocation: LocationAddress) => {
        if (selectedLocation) {
          this.preFillForm(selectedLocation);
        }
      }),
    );
  }

  protected setSelectedLocationAddress(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getLocationAddress());
    this.workplaceService.manuallyEnteredWorkplace$.next(true);
    const url = this.getNextRoute();
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.setBackLinkToConfirmDetails();
      return;
    }

    if (this.returnToWorkplaceNotFound && this.createAccountNewDesign) {
      this.backService.setBackLink({ url: [this.flow, 'new-workplace-not-found'] });
      return;
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

  protected setBackLinkToConfirmDetails(): void {
    this.backService.setBackLink({ url: [this.flow, 'confirm-workplace-details'] });
  }
}
