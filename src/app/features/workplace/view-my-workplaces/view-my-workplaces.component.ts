import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canAddWorkplace: boolean;
  public primaryWorkplace: Establishment;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public workplaces: Workplace[] = [];
  public workplacesCount = 0;

  constructor(
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private errorSummaryService: ErrorSummaryService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.canAddWorkplace = [Roles.Edit, Roles.Admin].includes(this.userService.loggedInUser.role);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.getEstablishments();
    this.setupServerErrorsMap();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
    ];
  }

  private getEstablishments(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe(
        (workplaces: GetWorkplacesResponse) => {
          if (workplaces.subsidaries) {
            this.workplaces = workplaces.subsidaries.establishments;
            this.workplacesCount = workplaces.subsidaries.count;
          }
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
