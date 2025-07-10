import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment, SortYourOtherWorkplaces } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
  styleUrls: ['view-my-workplaces.component.scss'],
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
  public providerId: string;
  public showMissingCqcMessage: boolean;
  public missingCqcLocations: any;
  public sortByValueFromHomePage: string;
  public sortBySelectedKey: string;
  public sortBySelectedValue = 'workplaceNameAsc';
  public sortOptions: any;
  public sortByParamMap = {
    '0_asc': 'workplaceNameAsc',
    '0_dsc': 'workplaceNameDesc',
    '1_asc': 'workplaceToCheckAsc',
    '1_dsc': 'workplaceToCheckDesc',
  };

  constructor(
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private workplaceService: WorkplaceService,
  ) {}

  ngOnInit(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.ALL_WORKPLACES);
    this.canAddEstablishment = this.permissionsService.can(this.primaryWorkplace.uid, 'canAddEstablishment');

    this.establishmentService.setCheckForChildWorkplaceChanges(true);
    const childWorkplaces = this.route.snapshot.data.childWorkplaces;
    this.totalWorkplaceCount = childWorkplaces.count;
    this.activeWorkplaceCount = childWorkplaces.activeWorkplaceCount;
    this.setWorkplaceVariables(childWorkplaces);

    this.setupServerErrorsMap();

    this.providerId = this.primaryWorkplace.provId;

    this.showMissingCqcMessage = this.route.snapshot.data?.cqcLocations?.showMissingCqcMessage;

    this.sortOptions = SortYourOtherWorkplaces;

    this.sortByValueFromHomePage = this.workplaceService.getAllWorkplacesSortValue();

    this.sortBySelectedValue = this.sortByValueFromHomePage ?? this.sortBySelectedValue;
    this.sortBySelectedKey =
      this.getSortKeyByValue(this.sortByParamMap, this.sortByValueFromHomePage) ?? this.sortBySelectedKey;
  }

  public getSortKeyByValue(object: any, value: string) {
    return Object.keys(object).find((key) => object[key] === value);
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
        getPendingWorkplaces: true,
        ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
        sortBy: this.sortBySelectedValue,
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
    this.searchTerm = searchTerm;
    this.handlePageUpdate(0);
  }

  public sortBy(sortType: string): void {
    this.sortBySelectedValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;

    this.getChildWorkplaces();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.alertService.removeAlert();
  }
}
