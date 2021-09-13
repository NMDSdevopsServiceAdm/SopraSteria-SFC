import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canAddEstablishment: boolean;
  public primaryWorkplace: Establishment;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public workplaces: Workplace[] = [];
  public workplacesCount = 0;
  public pendingWorkplaces: Workplace[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.canAddEstablishment = this.permissionsService.can(this.primaryWorkplace.uid, 'canAddEstablishment');
    this.getEstablishments();
    this.setupServerErrorsMap();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
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
            this.workplaces = this.workplaces.filter((item) => item.ustatus !== 'PENDING');
            this.pendingWorkplaces = workplaces.subsidaries.establishments.filter((item) => item.ustatus === 'PENDING');
            this.pendingWorkplaces.sort((a: any, b: any) => {
              const dateA = new Date(a.updated).getTime();
              const dateB = new Date(b.updated).getTime();
              return dateB > dateA ? 1 : -1;
            });
            this.workplacesCount =
              workplaces.subsidaries.count > this.pendingWorkplaces.length
                ? workplaces.subsidaries.count - this.pendingWorkplaces.length
                : this.pendingWorkplaces.length - workplaces.subsidaries.count;
          }
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
      ),
    );
  }

  public changeOwnershipAndPermissions($event) {
    if ($event) {
      this.getEstablishments();
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
