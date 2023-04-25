import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl:
    '../../../shared/directives/create-workplace/select-workplace-address/select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    public workplaceService: WorkplaceService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router, route, workplaceService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
    this.isParent = true;
  }

  protected setTitle(): void {
    this.title = 'Select the workplace address';
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select the workplace address if it's listed`;
  }

  protected navigateToConfirmDetails(): void {
    this.router.navigate([`${this.flow}/confirm-workplace-details`]);
  }
}
