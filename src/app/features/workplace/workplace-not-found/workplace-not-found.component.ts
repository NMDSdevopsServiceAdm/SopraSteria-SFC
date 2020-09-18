import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceNotFound } from '@features/workplace-find-and-select/workplace-not-found/workplace-not-found';

@Component({
  selector: 'app-workplace-not-found',
  templateUrl: './workplace-not-found.component.html',
})
export class WorkplaceNotFoundComponent extends WorkplaceNotFound {
  public workplace: Establishment;
  constructor(
    private registrationService: RegistrationService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected locationService: LocationService,
    protected router: Router,
    protected backService: BackService,
    private establishmentService: EstablishmentService,
  ) {
    super(formBuilder, backService, errorSummaryService, locationService, router);
  }
  protected init(): void {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
    this.workplace = this.establishmentService.establishment;
    this.setBackLink();
  }

  public onSuccess(data: LocationSearchResponse) {
    this.registrationService.locationAddresses$.next(data.postcodedata);
    this.navigateToSelectWorkplaceAddressRoute();
  }
  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/regulated-by-cqc`] });
  }
  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }
}
