import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { AddTotalStaffDirective } from '@shared/directives/create-workplace/add-total-staff/add-total-staff.directive';

@Component({
  selector: 'app-add-total-staff',
  templateUrl: '../../../shared/directives/create-workplace/add-total-staff/add-total-staff.component.html',
})
export class AddTotalStaffComponent extends AddTotalStaffDirective {
  constructor(
    protected router: Router,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    public establishmentService: EstablishmentService,
    public workplaceService: WorkplaceService,
    public totalStaffFormService: TotalStaffFormService,
  ) {
    super(
      router,
      backService,
      backLinkService,
      errorSummaryService,
      route,
      formBuilder,
      workplaceService,
      totalStaffFormService,
      establishmentService,
    );
  }

  protected init(): void {
    this.returnToConfirmDetails = this.workplaceInterfaceService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
  }

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'confirm-workplace-details'];
    this.router.navigate(url);
  }
}
