import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplaceDirective } from '@shared/directives/create-workplace/select-workplace/select-workplace.directive';

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
    protected route: ActivatedRoute,
    public workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, route, workplaceService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : `add-workplace/confirm-workplace-details`;
    this.isParent = true;
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.prefillForm();
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select the workplace if it's displayed`;
  }
}
