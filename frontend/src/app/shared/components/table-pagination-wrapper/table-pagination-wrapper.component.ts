import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
  standalone: false,
})
export class TablePaginationWrapperComponent implements OnInit, OnDestroy {
  @Input() maintainedPageIndex: number;
  @Input() totalCount: number;
  @Input() count: number;
  @Input() sortByParamMap: Record<string, string>;
  @Input() sortByValue: string;
  @Input() sortOptions: Record<string, string>;
  @Input() searchTerm: string;
  @Input() label = 'Search';
  @Input() accessibleLabel: string;
  @Input() setQueryInParams: boolean = false;
  @Input() wdfView: boolean = false;
  @Input() showNewPill: boolean = false;
  @Input() showUpdatePayForMultipleStaffLink: boolean = false;
  @Input() workplaceUid: string;
  @Output() fetchData = new EventEmitter<{
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }>();
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  private fragment: string;
  private tab: string;
  public sortBySelected: string;
  public showUpdatePayForMultipleStaffLinkOnTopOfSearchBar: boolean = false;
  public showUpdatePayForMultipleStaffLinkWhenNoSearchBar: boolean = false;
  public updatePayForMultipleStaffLinkText = 'Update pay for multiple staff';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.sortBySelected = Object.keys(this.sortByParamMap).find((key) => this.sortByParamMap[key] === this.sortByValue);
    if (this.maintainedPageIndex && this.maintainedPageIndex !== this.currentPageIndex) {
      this.currentPageIndex = this.maintainedPageIndex;
    }
    this.setShowUpdatePayForMultipleStaffLinkVariables();
    this.workerService.clearWorkersGroupedByJobRole();
  }

  public setShowUpdatePayForMultipleStaffLinkVariables(): void {
    this.showUpdatePayForMultipleStaffLinkOnTopOfSearchBar =
      this.showUpdatePayForMultipleStaffLink && this.totalCount > this.itemsPerPage && !this.wdfView;

    this.showUpdatePayForMultipleStaffLinkWhenNoSearchBar =
      this.showUpdatePayForMultipleStaffLink &&
      this.totalCount > 1 &&
      this.totalCount <= this.itemsPerPage &&
      !this.wdfView;
  }

  private checkForFragment(): void {
    if (this.router.url.includes('#')) {
      this.fragment = this.router.url.split('#')[1];
      this.tab = this.fragment.split('-')[0];
    }
  }

  private addQueryParams(): void {
    this.checkForFragment();
    if (this.searchTerm) {
      this.router.navigate([], {
        fragment: this.fragment,
        queryParams: { search: this.searchTerm, tab: this.tab },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], { fragment: this.fragment });
    }
  }

  public sortBy(sortType: string): void {
    this.sortByValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getData();
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;

    if (this.setQueryInParams) {
      this.addQueryParams();
    }

    this.getData();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
    this.getData();
  }

  private getData(): void {
    const properties = {
      index: this.currentPageIndex,
      itemsPerPage: this.itemsPerPage,
      searchTerm: this.searchTerm,
      sortByValue: this.sortByValue,
    };
    this.fetchData.emit(properties);
  }

  private setUpdatePayForMultiStaffViewed(): void {
    const data = {
      property: 'updatePayForMultiStaffViewed',
      value: true,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplaceUid, data).subscribe(),
    );
  }

  public handleOnClick() {
    if (this.showNewPill) {
      this.setUpdatePayForMultiStaffViewed();
    }
    this.router.navigate(['workplace', this.workplaceUid, 'update-pay-multiple-staff']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
