import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainService } from '@features/workplace-find-and-select/select-main-service/select-main-service';

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../workplace-find-and-select/select-main-service/select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainService {
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.flow = '/add-workplace';
    this.setBackLink();
  }

  protected getServiceCategories(): void {
    this.subscriptions.add(this.getServicesByCategory(this.workplaceService.isRegulated()));
  }

  protected setSelectedWorkplaceService(): void {
    this.subscriptions.add(
      this.workplaceService.selectedWorkplaceService$.subscribe((service: Service) => {
        if (service) {
          this.selectedMainService = service;
        }
      })
    );
  }

  protected onSuccess(): void {
    this.workplaceService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
    this.navigateToNextPage();
  }

  protected setBackLink(): void {
    let route: string;

    if (this.workplaceService.manuallyEnteredWorkplace$.value) {
      route = 'enter-workplace-address';
    } else {
      route = this.workplaceService.isRegulated() ? 'select-workplace' : 'enter-workplace-address';
    }

    this.backService.setBackLink({ url: [`${this.flow}/${route}`] });
  }
}
