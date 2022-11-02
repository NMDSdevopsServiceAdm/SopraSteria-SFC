import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SelectWorkplaceAddressDirective } from '@shared/directives/create-workplace/select-workplace-address/select-workplace-address.directive';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl:
    '../../../../shared/directives/create-workplace/select-workplace-address/select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent extends SelectWorkplaceAddressDirective {
  constructor(
    public registrationService: RegistrationService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router, route, registrationService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'regiastration/confirm-details';
  }

  protected setTitle(): void {
    this.title = 'Select your workplace address';
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select your workplace address if it's listed`;
  }

  protected navigateToConfirmDetails(): void {
    this.router.navigate([`${this.flow}/confirm-details`]);
  }
}
