import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  SelectMainServiceDirective,
} from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainServiceDirective {
  public isRegulated: boolean;

  constructor(
    public registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.isRegulated = this.registrationService.isRegulated();
    this.isParent = false;
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;

    this.setBackLink();
  }

  protected getServiceCategories(): void {
    this.subscriptions.add(this.getServicesByCategory(this.isRegulated));
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

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? 'confirm-details' : 'add-total-staff';
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow, 'confirm-details'] });
      return;
    }

    const route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
    this.backService.setBackLink({ url: [this.flow, route] });
  }

  private getCQCRegulatedBackLink(): string {
    if (this.registrationService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.registrationService.locationAddresses$.value.length == 1) {
      return 'your-workplace';
    }
    if (this.registrationService.locationAddresses$.value.length > 1) {
      return 'select-workplace';
    }
  }

  private getNonCQCRegulatedBackLink(): string {
    if (this.registrationService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.registrationService.manuallyEnteredWorkplaceName$.value) {
      return 'workplace-name';
    }
    return 'select-workplace-address';
  }
}
