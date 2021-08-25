import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { ChangePrimaryUserDirective } from '@shared/directives/user/change-primary-user.directive';

@Component({
  selector: 'app-change-primary-user-to-delete',
  templateUrl: './change-primary-user-to-delete.component.html',
})
export class ChangePrimaryUserToDeleteComponent extends ChangePrimaryUserDirective {
  constructor(
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected userService: UserService,
    protected establishmentService: EstablishmentService,
    protected breadcrumbService: BreadcrumbService,
    protected router: Router,
    protected route: ActivatedRoute,
    public alertService: AlertService,
  ) {
    super(
      formBuilder,
      errorSummaryService,
      userService,
      establishmentService,
      breadcrumbService,
      router,
      route,
      alertService,
    );
  }
}
