import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { SelectPrimaryUserDirective } from '@shared/directives/user/select-primary-user.directive';

@Component({
  selector: 'app-select-primary-user-delete',
  templateUrl: './select-primary-user-delete.component.html',
  standalone: false,
})
export class SelectPrimaryUserDeleteComponent extends SelectPrimaryUserDirective {
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected userService: UserService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    protected router: Router,
    public alertService: AlertService,
    public backLinkService: BackLinkService,
  ) {
    super(formBuilder, errorSummaryService, userService, establishmentService, router, route, alertService);
  }

  public cancelNavigation(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  protected setBackButtonOrBreadcrumbs(): void {
    // const userDetailsLink = this.router.url.split('/');
    // userDetailsLink.pop();

    this.backLinkService.showBackLink();
  }

  protected navigateToNextPage(): void {
    this.router.navigate(['../delete-user'], { relativeTo: this.route });
  }
}
