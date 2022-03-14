import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  public pages: Array<number>;
  public currentPageNo: number;

  @Input() noOfItemsOnPage: number;
  @Input() totalNoOfItems: number;
  @Output() emitCurrentPage = new EventEmitter<{ pageNo: number; noOfItemsOnPage: number }>(true);

  ngOnInit(): void {
    this.pages = this.createPageIndexArray();
    this.setPage(0);
  }

  public goToPage(e: Event, pageNo: number): void {
    e.preventDefault();
    this.setPage(pageNo);
  }

  private setPage(pageNo: number): void {
    this.currentPageNo = pageNo;
    this.emitCurrentPage.emit({ pageNo, noOfItemsOnPage: this.noOfItemsOnPage });
  }

  private createPageIndexArray(): Array<number> {
    const noOfPages = Math.ceil(this.totalNoOfItems / this.noOfItemsOnPage);
    return Array.from(Array(noOfPages).keys());
  }

  public showPageLink(index: number): boolean {
    return this.isWithinTwoOfCurrentPage(index) || this.isFirstOrLastPage(index);
  }

  private isWithinTwoOfCurrentPage(index: number): boolean {
    return Math.abs(index - this.currentPageNo) <= 2;
  }

  private isFirstOrLastPage(index: number): boolean {
    return index === 0 || index === this.pages.length - 1;
  }

  public showElipsisCheck(index: number): boolean {
    return Math.abs(index - this.currentPageNo) === 3 && index !== 0 && index !== this.pages.length - 1;
  }
}
