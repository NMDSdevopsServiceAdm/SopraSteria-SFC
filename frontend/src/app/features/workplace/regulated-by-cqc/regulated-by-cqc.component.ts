import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { RegulatedByCQCDirective } from '@features/workplace-find-and-select/regulated-by-cqc/regulated-by-cqc';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends RegulatedByCQCDirective {
  public nextRoute: string[];

  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected locationService: LocationService,
    protected route: ActivatedRoute,
    protected router: Router,
    private establishmentService: EstablishmentService,
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, route, router);
  }

  protected init() {
    this.flow = `workplace/${this.establishmentService.establishmentId}`;
    this.isCQCLocationUpdate = true;
    this.setBackLink();
    this.validateLocationChange();
  }

  protected setBackLink(): void {
    this.backService.setBackLink(this.establishmentService.returnTo);
  }

  get return() {
    return this.establishmentService.returnTo;
  }

  public navigateAction(payload: { action: string; save: boolean }): void {
    if (!payload.save) {
      this.navigate(payload.action);
    }
  }

  protected navigate(action): void {
    if (!action) {
      return;
    }

    if (action === 'continue') {
      this.router.navigate(this.nextRoute);
      return;
    } else if (action === 'return') {
      this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
      return;
    }
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.workplaceService.isRegulated$.next(this.regulatedByCQC.value === 'yes');
    if (data.success === 1) {
      this.workplaceService.locationAddresses$.next(data.locationdata || data.postcodedata);
      this.navigateToNextRoute(data);
    }
  }

  protected onLocationFailure() {
    this.workplaceService.isRegulated$.next(this.regulatedByCQC.value === 'yes');
    this.navigateToWorkplaceNotFoundRoute();
  }

  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }
}
