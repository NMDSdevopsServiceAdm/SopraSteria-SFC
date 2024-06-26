import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainServiceDirective } from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainServiceDirective {
  public isRegulated: boolean;
  public newHomeDesignParentFlag: boolean;
  public workplaceServiceId: number;
  public headOfficeServicesId = 16;

  constructor(
    public registrationService: RegistrationService,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    private route: ActivatedRoute,
    private featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.isRegulated = this.registrationService.isRegulated();
    this.isParent = false;
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.newHomeDesignParentFlag = this.featureFlagsService.newHomeDesignParentFlag;
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
    this.workplaceServiceId = this.form.get('workplaceService').value;
    let url;

    if (this.workplaceServiceId === this.headOfficeServicesId && this.newHomeDesignParentFlag) {
      url = [this.flow, 'parent-workplace-accounts'];
    } else {
      url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'add-total-staff'];
    }
    this.router.navigate(url);
  }
}
