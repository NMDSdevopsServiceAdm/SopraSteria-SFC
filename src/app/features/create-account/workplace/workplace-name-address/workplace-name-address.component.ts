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
    protected featureFlagsService: FeatureFlagsService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, route, router, featureFlagsService, registrationService);
  }

  protected init(): void {
    this.title = `What's your workplace name and address?`;
    this.workplaceErrorMessage = 'Enter the name of your workplace';
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.returnToWorkplaceNotFound = this.registrationService.workplaceNotFound$.value;
    this.manuallyEnteredWorkplace = this.registrationService.manuallyEnteredWorkplace$.value;
    this.isCqcRegulated = this.registrationService.isCqcRegulated$.value;

    this.setupPreFillForm();
  }

  protected setFlow(): void {
    this.flow = '/registration';
  }

  protected setConfirmDetailsBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'confirm-details'] });
  }

  protected getNextRoute(): string {
    if (this.createAccountNewDesign) {
      return this.returnToConfirmDetails ? 'confirm-details' : 'new-select-main-service';
    }
    return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'select-main-service';
  }
}
