import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainService } from '@features/workplace-find-and-select/select-main-service/select-main-service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-new-select-main-service',
  templateUrl: '../../../workplace-find-and-select/select-main-service/select-main-service.component.html',
})
export class NewSelectMainServiceComponent extends SelectMainService {
  public isRegulated: boolean;
  public isParent: boolean;
  public workplace: Establishment;
  public createAccountNewDesign: boolean;

  constructor(
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = '/registration';
    this.setBackLink();
    this.isRegulated = this.registrationService.isRegulated();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
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
