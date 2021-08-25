import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { ChangePrimaryUserDirective } from '@shared/directives/user/change-primary-user.directive';

@Component({
  selector: 'app-change-primary-user',
  templateUrl: './change-primary-user.component.html',
})
export class ChangePrimaryUserComponent extends ChangePrimaryUserDirective {
  constructor(
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected userService: UserService,
    protected establishmentService: EstablishmentService,
    protected router: Router,
    protected route: ActivatedRoute,
    public alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
  ) {
    super(formBuilder, errorSummaryService, userService, establishmentService, router, route, alertService);
  }

  public cancelNavigation(): void {
    this.router.navigate(['../permissions'], { relativeTo: this.route });
  }

  protected setBackButtonOrBreadcrumbs(): void {
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
  }
}
