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

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainServiceDirective {
  public isRegulated: boolean;
  public workplace: Establishment;

  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    public workplaceService: WorkplaceService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
    this.isRegulated = this.workplaceService.isRegulated();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent;
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;

    this.setBackLink();
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

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceService',
        type: [
          {
            name: 'required',
            message: 'Select the main service it provides',
          },
        ],
      },
    ];
  }

  protected onSuccess(): void {
    this.workplaceService.selectedWorkplaceService$.next(this.getSelectedWorkPlaceService());
    this.navigateToNextPage();
  }

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? 'confirm-workplace-details' : 'add-total-staff';
    this.router.navigate([this.flow, url]);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow, 'confirm-workplace-details'] });
      return;
    }

    this.backService.setBackLink({ url: [this.flow, 'type-of-employer'] });
  }
}
