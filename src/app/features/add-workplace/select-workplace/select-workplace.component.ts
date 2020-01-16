import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectWorkplace } from '@features/workplace-find-and-select/select-workplace/select-workplace';

@Component({
  selector: 'app-select-workplace',
  templateUrl: '../../workplace-find-and-select/select-workplace/select-workplace.component.html',
})
export class SelectWorkplaceComponent extends SelectWorkplace {
  constructor(
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.setupSubscription();
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.workplaceService.locationAddresses$.subscribe(
        (locationAddresses: Array<LocationAddress>) => (this.locationAddresses = locationAddresses)
      )
    );
  }

  protected save(): void {
    this.workplaceService.selectedLocationAddress$.next(this.getSelectedLocation());
    this.router.navigate([`${this.flow}/select-main-service`]);
  }
}
