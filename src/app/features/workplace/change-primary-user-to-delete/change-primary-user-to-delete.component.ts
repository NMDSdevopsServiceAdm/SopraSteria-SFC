import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
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
    protected route: ActivatedRoute,
    protected router: Router,
    public alertService: AlertService,
    public backService: BackService,
  ) {
    super(formBuilder, errorSummaryService, userService, establishmentService, router, route, alertService);
  }

  public cancelNavigation(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  protected setBackButtonOrBreadcrumbs(): void {
    const userDetailsLink = this.router.url.split('/');
    userDetailsLink.pop();

    this.backService.setBackLink({ url: userDetailsLink });
  }

  protected navigateToNextPage(): void {
    this.router.navigate(['../delete-user'], { relativeTo: this.route });
  }
}
