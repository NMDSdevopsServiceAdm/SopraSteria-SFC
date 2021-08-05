import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import {
  SelectMainServiceDirective,
} from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-new-select-main-service',
  templateUrl: '../../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class NewSelectMainServiceComponent extends SelectMainServiceDirective {
  public isRegulated: boolean;
  public isParent: boolean;
  public workplace: Establishment;
  public createAccountNewDesign: boolean;

  constructor(
    public registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.isRegulated = this.registrationService.isRegulated();
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
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
    const url = this.returnToConfirmDetails ? 'confirm-details' : 'add-user-details';
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    let route: string;
    if (this.returnToConfirmDetails) {
      route = this.createAccountNewDesign ? 'confirm-details' : 'confirm-workplace-details';
      this.backService.setBackLink({ url: [this.flow, route] });
      return;
    }

    route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
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
      if (this.registrationService.locationAddresses$.value.length > 0) {
        return 'workplace-name-address';
      }
      return 'workplace-address-not-found';
    }

    if (this.registrationService.manuallyEnteredWorkplaceName$.value) {
      return 'workplace-name';
    }
    return 'select-workplace-address';
  }
}
