import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { NewRegulatedByCqcDirective } from '@shared/directives/create-workplace/new-regulated-by-cqc/new-regulated-by-cqc.directive';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: '../../../../shared/directives/create-workplace/new-regulated-by-cqc/regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends NewRegulatedByCqcDirective {
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(formBuilder, errorSummaryService, registrationService, backService, backLinkService, route, router);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }

  protected setFlowToInProgress(): void {
    this.registrationService.registrationInProgress$.next(true);
  }
}
