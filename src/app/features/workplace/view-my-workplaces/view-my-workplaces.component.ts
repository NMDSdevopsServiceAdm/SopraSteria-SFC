import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

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
  public workplaceCount: number;
  public totalWorkplaceCount: number;
  public activeWorkplaceCount: number;
  public itemsPerPage = 12;
  public currentPageIndex = 0;
  private searchTerm = '';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.canAddEstablishment = this.permissionsService.can(this.primaryWorkplace.uid, 'canAddEstablishment');

    const childWorkplaces = this.route.snapshot.data.childWorkplaces;
    this.totalWorkplaceCount = childWorkplaces.count;
    this.activeWorkplaceCount = childWorkplaces.activeWorkplaceCount;
    this.setWorkplaceVariables(childWorkplaces);

    this.setupServerErrorsMap();
    this.setSearchIfPrevious();
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');

    if (search) {
      this.searchTerm = search;
    }
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'Service unavailable.',
      },
    ];
  }

  private getChildWorkplaces(): void {
    this.establishmentService
      .getChildWorkplaces(this.primaryWorkplace.uid, {
        pageIndex: this.currentPageIndex,
        itemsPerPage: this.itemsPerPage,
        ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
      })
      .pipe(take(1))
      .subscribe(
        (data: GetChildWorkplacesResponse) => {
          this.setWorkplaceVariables(data);
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
      );
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;

    this.getChildWorkplaces();
  }

  public changeOwnershipAndPermissions($event: Event): void {
    if ($event) {
      this.getChildWorkplaces();
    }
  }

  private setWorkplaceVariables(data: GetChildWorkplacesResponse): void {
    this.workplaces = data.childWorkplaces;
    this.workplaceCount = data.count;
  }

  public handleSearch(searchTerm: string): void {
    this.router.navigate([], {
      queryParams: { search: searchTerm },
      queryParamsHandling: 'merge',
    });
    this.searchTerm = searchTerm;
    this.handlePageUpdate(0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
