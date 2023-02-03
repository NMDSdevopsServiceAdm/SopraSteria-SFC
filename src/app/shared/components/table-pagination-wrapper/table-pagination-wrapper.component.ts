import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
})
export class TablePaginationWrapperComponent implements OnInit {
  @Input() totalCount: number;
  @Input() count: number;
  @Input() sortByParamMap: any;
  @Input() sortByValue: string;
  @Input() sortOptions: any;
  @Input() searchTerm: string;
  @Input() label = 'Search';
  @Input() accessibleLabel: string;
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkForFragment();
  }

  private checkForFragment(): void {
    if (this.router.url.includes('#')) {
      this.fragment = this.router.url.split('#')[1];
      this.tab = this.fragment.split('-')[0];
    }
  }

  private addQueryParams(): void {
    if (this.searchTerm) {
      this.router.navigate([], {
        fragment: this.fragment,
        queryParams: { search: this.searchTerm, tab: this.tab },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], { fragment: 'staff-records' });
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
    this.addQueryParams();
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
    console.log('***** getData ******');
    console.log(properties);
    this.fetchData.emit(properties);
  }
}
