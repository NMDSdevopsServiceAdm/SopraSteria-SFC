import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
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
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
  ) {
    super(formBuilder, backService, router, route, errorSummaryService, registrationService);
  }

  protected init(): void {
    this.isRegulated = this.registrationService.isRegulated();
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }

  // public setBackLink(): void {
  //   if (this.returnToConfirmDetails) {
  //     this.backService.setBackLink({ url: [this.flow, 'confirm-details'] });
  //     return;
  //   }

  //   const route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
  //   this.backService.setBackLink({ url: [this.flow, route] });
  // }

  // protected navigateToNextPage(): void {
  //   const url = this.returnToConfirmDetails ? 'confirm-details' : 'select-main-service';
  //   this.router.navigate([this.flow, url]);
  // }
}
