import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnInit {
  public pages: Array<number>;
  public currentPageNo: number;

  @Input() noOfItemsOnPage: number;
  @Input() totalNoOfItems: number;
  @Output() emitCurrentPage = new EventEmitter<number>(true);

  ngOnInit(): void {
    const noOfPages = Math.ceil(this.totalNoOfItems / this.noOfItemsOnPage);
    this.pages = Array.from(Array(noOfPages).keys());
    this.setPage(0);
  }

  public goToPage(e: Event, pageNo: number): void {
    e.preventDefault();
    this.setPage(pageNo);
  }

  private setPage(pageNo: number): void {
    this.currentPageNo = pageNo;
    this.emitCurrentPage.emit(pageNo);
  }
}
