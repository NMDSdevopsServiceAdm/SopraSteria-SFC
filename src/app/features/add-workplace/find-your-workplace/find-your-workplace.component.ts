import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { FindYourWorkplaceDirective } from '@shared/directives/create-workplace/find-your-workplace/find-your-workplace.directive';

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
    public workplaceService: WorkplaceService,
    protected locationService: LocationService,
  ) {
    super(router, backService, errorSummaryService, route, formBuilder, workplaceService, locationService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
  }

  protected navigateToConfirmDetails(): void {
    this.backService.setBackLink({ url: [this.flow] });
  }
}
