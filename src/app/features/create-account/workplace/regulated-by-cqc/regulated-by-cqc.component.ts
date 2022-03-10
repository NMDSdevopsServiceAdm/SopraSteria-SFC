import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { NewRegulatedByCqcDirective } from '@shared/directives/create-workplace/new-regulated-by-cqc/new-regulated-by-cqc.directive';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends NewRegulatedByCqcDirective {
  constructor(
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(formBuilder, errorSummaryService, registrationService, backService, route, router);
  }

  protected setFlowToInProgress(): void {
    this.registrationService.registrationInProgress$.next(true);
  }
}
