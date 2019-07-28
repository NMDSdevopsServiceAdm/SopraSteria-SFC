import { WorkplaceService } from '@core/services/workplace.service';
import { RegulatedByCQC } from '@features/regulated-by-cqc/regulated-by-cqc';
import { Component } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { LocationService } from '@core/services/location.service';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends RegulatedByCQC {
  constructor(
      private workplaceService: WorkplaceService,
      protected backService: BackService,
      protected errorSummaryService: ErrorSummaryService,
      protected formBuilder: FormBuilder,
      protected locationService: LocationService,
      protected route: ActivatedRoute,
      protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, route, router);
  }

  protected init() {
    this.setBackLink();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/add-workplace/start'] });
  }

  protected onSuccess(data: LocationSearchResponse): void {
    if (data.success === 1) {
      this.workplaceService.locationAddresses$.next(data.locationdata || data.postcodedata);
      if (data.locationdata) {
        this.router.navigate(['/add-workplace/select-workplace']);
      } else {
        this.router.navigate(['/add-workplace/select-workplace-address']);
      }
    }
  }
}
