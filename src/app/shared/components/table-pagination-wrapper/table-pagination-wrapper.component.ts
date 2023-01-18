import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
})
export class TablePaginationWrapperComponent {
  @Input() workerCount: number;
  @Input() searchTerm: string;
  @Output() fetchWorkers = new EventEmitter<{ index: number; itemsPerPage: number }>();
  public itemsPerPage = 15;
  public currentPageIndex = 0;

  constructor(private router: Router) {}

  private addQueryParams(): void {
    this.router.navigate([], {
      fragment: 'staff-records',
      queryParams: { search: this.searchTerm, tab: 'staff' },
      queryParamsHandling: 'merge',
    });
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
    this.addQueryParams();
    // this.getPageOfWorkers();
  }

  public handlePageUpdate(pageIndex: number): void {
    console.log('*** handle page update ***');
    console.log(pageIndex);
    this.currentPageIndex = pageIndex;
    const properties = { index: this.currentPageIndex, itemsPerPage: this.itemsPerPage };
    this.fetchWorkers.emit(properties);
  }
}
