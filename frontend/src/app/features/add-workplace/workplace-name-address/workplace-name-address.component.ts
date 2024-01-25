import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { WorkplaceNameAddressDirective } from '@shared/directives/create-workplace/workplace-name-address/workplace-name-address';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl:
    '../../../shared/directives/create-workplace/workplace-name-address/workplace-name-address.component.html',
})
export class WorkplaceNameAddressComponent extends WorkplaceNameAddressDirective {
  constructor(
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, route, router, workplaceService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
    this.setServiceVariables();
    this.setupPreFillForm();
  }

  protected setTitle(): void {
    this.title = `What's the workplace name and address?`;
  }

  protected setErrorMessage(): void {
    this.workplaceErrorMessage = 'Enter the name of the workplace';
  }

  protected setConfirmDetailsBackLink(): void {
    this.backService.setBackLink({ url: [this.flow] });
  }

  protected getNextRoute(): string {
    return this.returnToConfirmDetails ? 'confirm-workplace-details' : 'type-of-employer';
  }
}
