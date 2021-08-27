import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceDirective } from '@shared/directives/create-workplace/select-workplace/select-workplace.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-workplace',
  templateUrl: '../../../shared/directives/create-workplace/select-workplace/select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplaceDirective {
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    public workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, featureFlagsService, workplaceService);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.prefillForm();
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select the workplace if it's displayed`;
  }

  protected setTitle(): void {
    this.title = 'Select the workplace you want to add';
  }

  public setNextRoute(): void {
    if (this.createAccountNewDesign) {
      this.nextRoute = this.returnToConfirmDetails ? 'confirm-workplace-details' : 'new-select-main-service';
    } else {
      this.nextRoute = this.returnToConfirmDetails ? 'confirm-workplace-details' : 'select-main-service';
    }
  }
}
