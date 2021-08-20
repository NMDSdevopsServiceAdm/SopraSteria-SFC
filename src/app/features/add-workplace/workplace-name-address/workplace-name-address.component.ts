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
  }

  private async setFeatureFlag() {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  protected setConfirmDetailsBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'confirm-workplace-details'] });
  }

  protected getNextRoute(): string {
    if (this.createAccountNewDesign) {
      return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'new-select-main-service';
    }
    return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'select-main-service';
  }
}
