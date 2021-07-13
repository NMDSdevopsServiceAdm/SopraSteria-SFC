import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainService } from '@features/workplace-find-and-select/select-main-service/select-main-service';

@Component({
  selector: 'app-new-select-main-service',
  templateUrl: '../../../workplace-find-and-select/select-main-service/select-main-service.component.html',
})
export class NewSelectMainServiceComponent extends SelectMainService {
  public isRegulated: boolean;

  constructor(
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.flow = '/registration';
    this.setBackLink();
    this.isRegulated = this.registrationService.isRegulated();
  }

  protected getServiceCategories(): void {
    this.subscriptions.add(this.getServicesByCategory(this.registrationService.isRegulated()));
  }

  protected setSelectedWorkplaceService(): void {
    this.subscriptions.add(
      this.registrationService.selectedWorkplaceService$.subscribe((service: Service) => {
        if (service) {
          this.selectedMainService = service;
        }
      }),
    );
  }

  protected onSuccess(): void {
    this.registrationService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
    this.navigateToNextPage();
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/your-workplace`] });
  }
}
