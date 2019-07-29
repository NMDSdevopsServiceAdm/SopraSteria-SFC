import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainService } from '@features/workplace-find-and-select/select-main-service/select-main-service';

@Component({
  selector: 'app-select-main-service',
  templateUrl: './select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainService {
  constructor(
    private registrationService: RegistrationService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.flow = '/registration';
  }

  protected getSelectedLocation(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe((location: LocationAddress) =>
        this.getServicesByCategory(location)
      )
    );
  }

  protected getSelectedWorkplace(): void {
    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe((workplace: Service) => {
        if (workplace) {
          this.selectedWorkplace = workplace;
        }
      })
    );
  }

  protected onSuccess(): void {
    this.registrationService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
  }
}
