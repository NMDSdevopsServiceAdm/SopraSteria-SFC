import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';
import { AddTotalStaffDirective } from '@shared/directives/create-workplace/add-total-staff/add-total-staff.directive';

@Component({
  selector: 'app-add-total-staff',
  templateUrl: '../../../../shared/directives/create-workplace/add-total-staff/add-total-staff.component.html',
})
export class AddTotalStaffComponent extends AddTotalStaffDirective {
  constructor(
    protected router: Router,
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    public registrationService: RegistrationService,
    public totalStaffFormService: TotalStaffFormService,
    public establishmentService: EstablishmentService,
  ) {
    super(
      router,
      backService,
      backLinkService,
      errorSummaryService,
      route,
      formBuilder,
      registrationService,
      totalStaffFormService,
      establishmentService,
    );
  }

  protected init(): void {
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'add-user-details'];
    this.router.navigate(url);
  }
}
