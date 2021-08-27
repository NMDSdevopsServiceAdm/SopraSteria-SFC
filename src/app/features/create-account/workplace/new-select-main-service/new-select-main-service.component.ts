import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainServiceDirective } from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-new-select-main-service',
  templateUrl: '../../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class NewSelectMainServiceComponent extends SelectMainServiceDirective {
  public createAccountNewDesign: boolean;

  constructor(
    public registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    private featureFlagsService: FeatureFlagsService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.isRegulated = this.registrationService.isRegulated();
    this.isParent = false;
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
    this.setBackLink();
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
      return 'workplace-name-address';
    }
    if (this.registrationService.manuallyEnteredWorkplaceName$.value) {
      return 'workplace-name';
    }
    return 'select-workplace-address';
  }
}
