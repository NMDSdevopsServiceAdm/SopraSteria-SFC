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
    protected workplaceService: WorkplaceService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected async init(): Promise<void> {
    this.flow = 'add-workplace';
    this.setBackLink();
    this.isRegulated = this.workplaceService.isRegulated();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
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
    const url = this.isParent ? 'confirm-workplace-details' : 'add-user-details';
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/your-workplace`] });
  }
}
