import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
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
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    public registrationService: RegistrationService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, registrationService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.prefillForm();
  }

  public setNextRoute(): void {
    this.nextRoute = this.returnToConfirmDetails ? 'confirm-details' : 'select-main-service';
  }
}
