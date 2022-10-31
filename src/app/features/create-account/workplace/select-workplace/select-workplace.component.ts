import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { SelectWorkplaceDirective } from '@shared/directives/create-workplace/select-workplace/select-workplace.directive';

@Component({
  selector: 'app-select-workplace',
  templateUrl: '../../../../shared/directives/create-workplace/select-workplace/select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplaceDirective {
  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    public registrationService: RegistrationService,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router, route, registrationService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
  }
}
