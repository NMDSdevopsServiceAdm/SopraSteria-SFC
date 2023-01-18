import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
})
export class TablePaginationWrapperComponent implements OnInit {
  @Input() totalWorkerCount: number;
  @Input() workerCount: number;
  @Input() sortByParamMap: any;
  @Input() sortByValue: string;
  @Input() sortOptions: any;
  // @Input() searchTerm: string;
  @Output() fetchWorkers = new EventEmitter<{ index: number; itemsPerPage: number; searchTerm: string }>();
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  private searchTerm = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('****************');
    console.log(this.sortOptions);
    console.log(this.sortByParamMap);
  }

  private addQueryParams(): void {
    this.router.navigate([], {
      fragment: 'staff-records',
      queryParams: { search: this.searchTerm, tab: 'staff' },
      queryParamsHandling: 'merge',
    });
  }

  public sortBy(sortType: string): void {
    this.sortByValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getWorkers();
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
    this.addQueryParams();
    this.getWorkers();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
    this.getWorkers();
  }

  private getWorkers(): void {
    const properties = {
      index: this.currentPageIndex,
      itemsPerPage: this.itemsPerPage,
      searchTerm: this.searchTerm,
      sortByValue: this.sortByValue,
    };
    this.fetchWorkers.emit(properties);
  }
}
