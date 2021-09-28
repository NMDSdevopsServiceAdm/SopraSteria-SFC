import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  public pages: Array<any>;
  public noOfPages: number;
  public currentPageNo: number;
  private _items: Array<any> = null;

  @Input() noOfItemsOnPage: number;
  @Output() emitCurrentPage = new EventEmitter<any[]>(true);
  @Input() set items(value: Array<any>) {
    this._items = value;
    this.setUpPages();
  }

  ngOnInit(): void {
    this.setUpPages();
  }

  private setUpPages(): void {
    this.breakIntoPages(this._items, this.noOfItemsOnPage);
    this.setPage(0);
  }

  private breakIntoPages(items, pageSize) {
    const pages = [];
    for (let i = 0; i < items.length; i += pageSize) {
      pages.push(items.slice(i, i + pageSize));
    }

    this.noOfPages = pages.length;
    this.pages = pages;
  }

  public goToPreviousPage(e): void {
    e.preventDefault();
    this.setPage(this.currentPageNo - 1);
  }

  public goToNextPage(e): void {
    e.preventDefault();
    this.setPage(this.currentPageNo + 1);
  }

  public goToSelectedPage(e, pageNo): void {
    e.preventDefault();
    this.setPage(pageNo);
  }

  private setPage(pageNo: number): void {
    this.currentPageNo = pageNo;
    this.emitCurrentPage.emit(this.pages[this.currentPageNo]);
  }
}
