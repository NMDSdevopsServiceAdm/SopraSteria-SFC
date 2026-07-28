import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  WorkplaceNameAddressDirective,
} from '@shared/directives/create-workplace/workplace-name-address/workplace-name-address';

@Component({
  selector: 'app-workplace-name-address-create-account',
  templateUrl:
    '../../../../shared/directives/create-workplace/workplace-name-address/workplace-name-address.component.html',
  standalone: false,
})
export class WorkplaceNameAddressComponent extends WorkplaceNameAddressDirective {
  constructor(
    public registrationService: RegistrationService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(backLinkService, errorSummaryService, formBuilder, route, router, registrationService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.setServiceVariables();
    this.setupPreFillForm();
  }

  protected setTitle(): void {
    this.title = `What's your workplace name and address?`;
  }

  protected setErrorMessage(): void {
    this.workplaceErrorMessage = 'Enter the name of your workplace';
  }

  protected setConfirmDetailsBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected getNextRoute(): string {
    return this.returnToConfirmDetails ? 'confirm-details' : 'type-of-employer';
  }
}
