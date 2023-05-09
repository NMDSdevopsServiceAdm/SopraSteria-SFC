import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { RegistrationRequestDirective } from '@shared/directives/admin/registration-requests/registration-request.directive';

@Component({
  selector: 'app-rejected-registration-request',
  templateUrl: './rejected-registration-request.component.html',
})
export class RejectedRegistrationRequestComponent extends RegistrationRequestDirective {
  constructor(
    protected breadcrumbService: BreadcrumbService,
    public registrationsService: RegistrationsService,
    protected route: ActivatedRoute,
    protected formBuilder: UntypedFormBuilder,
    protected switchWorkplaceService: SwitchWorkplaceService,
  ) {
    super(registrationsService, breadcrumbService, route, formBuilder, switchWorkplaceService);
  }

  protected setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_REJECTED_REGISTRATIONS);
  }
}
