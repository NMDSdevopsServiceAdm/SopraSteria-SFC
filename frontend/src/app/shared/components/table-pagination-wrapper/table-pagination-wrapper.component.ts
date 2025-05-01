import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
})
export class TablePaginationWrapperComponent implements OnInit {
  @Input() totalCount: number;
  @Input() count: number;
  @Input() sortByParamMap: Record<string, string>;
  @Input() sortByValue: string;
  @Input() sortOptions: Record<string, string>;
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
  public sortBySelected: string;

  constructor() {}

  ngOnInit(): void {
    this.sortBySelected = Object.keys(this.sortByParamMap).find((key) => this.sortByParamMap[key] === this.sortByValue);
  }

  public sortBy(sortType: string): void {
    this.sortByValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getData();
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
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
}
