import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  FindYourWorkplaceDirective,
} from '@shared/directives/create-workplace/find-your-workplace/find-your-workplace.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-find-your-workplace',
  templateUrl: '../../../shared/directives/create-workplace/find-your-workplace/find-your-workplace.component.html',
})
export class FindYourWorkplaceComponent extends FindYourWorkplaceDirective {
  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected workplaceService: WorkplaceService,
    protected locationService: LocationService,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(
      router,
      backService,
      errorSummaryService,
      route,
      formBuilder,
      workplaceService,
      locationService,
      featureFlagsService,
    );
  }

  protected navigateToConfirmDetails(): void {
    this.backService.setBackLink({ url: [this.flow, 'confirm-workplace-details'] });
  }
}
