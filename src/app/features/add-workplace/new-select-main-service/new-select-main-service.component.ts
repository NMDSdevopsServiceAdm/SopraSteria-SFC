import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainServiceDirective } from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-new-select-main-service',
  templateUrl: '../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class NewSelectMainServiceComponent extends SelectMainServiceDirective {
  public isRegulated: boolean;
  public isParent: boolean;
  public workplace: Establishment;
  public createAccountNewDesign: boolean;

  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    public workplaceService: WorkplaceService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = 'add-workplace';
    this.isRegulated = this.workplaceService.isRegulated();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.setBackLink();
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  protected getServiceCategories(): void {
    this.subscriptions.add(this.getServicesByCategory(this.isRegulated));
  }

  protected setSelectedWorkplaceService(): void {
    this.subscriptions.add(
      this.workplaceService.selectedWorkplaceService$.subscribe((service: Service) => {
        if (service) {
          this.selectedMainService = service;
        }
      }),
    );
  }

  protected onSuccess(): void {
    this.workplaceService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
    this.navigateToNextPage();
  }

  protected navigateToNextPage(): void {
    this.router.navigate([this.flow, 'confirm-workplace-details']);
  }

  public setBackLink(): void {
    const route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
    this.backService.setBackLink({ url: [this.flow, route] });
  }

  private getCQCRegulatedBackLink(): string {
    if (this.workplaceService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.workplaceService.locationAddresses$.value.length == 1) {
      return 'your-workplace';
    }
    if (this.workplaceService.locationAddresses$.value.length > 1) {
      return 'select-workplace';
    }
  }

  private getNonCQCRegulatedBackLink(): string {
    if (this.workplaceService.manuallyEnteredWorkplace$.value) {
      if (this.workplaceService.locationAddresses$.value.length > 0) {
        return 'workplace-name-address';
      } else {
        return 'workplace-address-not-found';
      }
    } else {
      return 'select-workplace-address';
    }
  }
}
