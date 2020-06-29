import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { RegulatedByCQC } from '@features/workplace-find-and-select/regulated-by-cqc/regulated-by-cqc';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends RegulatedByCQC implements AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected route: ActivatedRoute,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, route, router);
  }

  protected init() {
    this.flow = '/registration';
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'start'] });
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.registrationService.isRegulated$.next(this.regulatedByCQC.value === 'yes');
    this.registrationService.isCqcRegulated$.next(this.regulatedByCQC.value === 'yes' ? true : false);
    this.registrationService.registrationInProgress$.next(true);

    if (data.success === 1) {
      this.registrationService.locationAddresses$.next(data.locationdata || data.postcodedata);
      this.navigateToNextRoute(data);
    }
  }

  protected onLocationFailure() {
    this.registrationService.isRegulated$.next(this.regulatedByCQC.value === 'yes');
    this.registrationService.registrationInProgress$.next(true);
    this.navigateToWorkplaceNotFoundRoute();
  }
}
