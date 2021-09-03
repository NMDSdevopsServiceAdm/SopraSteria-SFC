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
    protected featureFlagsService: FeatureFlagsService,
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router, featureFlagsService, workplaceService);
  }

  protected init(): void {
    this.setServiceVariables();
    this.setupPreFillForm();
  }

  protected setFlow(): void {
    this.flow = '/add-workplace';
  }

  protected setTitle(): void {
    this.title = `What's the workplace name and address?`;
  }

  protected setErrorMessage(): void {
    this.workplaceErrorMessage = 'Enter the name of the workplace';
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
