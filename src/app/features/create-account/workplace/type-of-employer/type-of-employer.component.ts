import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { TypeOfEmployerDirective } from '@shared/directives/create-workplace/type-of-employer/type-of-employer.directive';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: '../../../../shared/directives/create-workplace/type-of-employer/type-of-employer.component.html',
})
export class TypeOfEmployerComponent extends TypeOfEmployerDirective {
  public question = 'What type of employer is your workplace?';

  constructor(
    protected formBuilder: UntypedFormBuilder,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
  ) {
    super(formBuilder, backService, backLinkService, router, route, errorSummaryService, registrationService);
  }

  protected init(): void {
    this.isRegulated = this.registrationService.isRegulated();
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }
}
