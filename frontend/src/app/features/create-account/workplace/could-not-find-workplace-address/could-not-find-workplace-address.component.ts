import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import {
  CouldNotFindWorkplaceAddressDirective,
} from '@shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.directive';

@Component({
  selector: 'app-could-not-find-workplace-address-create-account',
  templateUrl:
    '../../../../shared/directives/create-workplace/could-not-find-workplace-address/could-not-find-workplace-address.component.html',
  standalone: false,
})
export class CouldNotFindWorkplaceAddressComponent extends CouldNotFindWorkplaceAddressDirective {
  constructor(
    public registrationService: RegistrationService,
    public backLinkService: BackLinkService,
    protected establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(registrationService, backLinkService, establishmentService, formBuilder, errorSummaryService, router, route);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }
}
