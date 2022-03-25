import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnInit {
  public pages: Array<number>;
  public isBigWindow: boolean;

  @Input() itemsPerPage: number;
  private _totalNoOfItems: number;
  @Input() set totalNoOfItems(value: number) {
    this._totalNoOfItems = value;
    this.pages = this.createPageIndexArray();
  }

  @Input() currentPageIndex = 0;
  @Output() currentPageIndexChange = new EventEmitter<number>(true);

  ngOnInit(): void {
    this.setIsBigWindow();
  }

  public goToPage(e: Event, pageNo: number): void {
    e.preventDefault();
    this.setPage(pageNo);
  }

  private setPage(pageIndex: number): void {
    this.currentPageIndexChange.emit(pageIndex);
  }

  private createPageIndexArray(): Array<number> {
    const noOfPages = Math.ceil(this._totalNoOfItems / this.itemsPerPage);
    return Array.from(Array(noOfPages).keys());
  }

  public showPageLink(index: number): boolean {
    return this.isWithinTwoOfCurrentPage(index) || this.isFirstOrLastPage(index);
  }

  private isWithinTwoOfCurrentPage(index: number): boolean {
    return Math.abs(index - this.currentPageIndex) <= 2;
  }

  private isFirstOrLastPage(index: number): boolean {
    return index === 0 || index === this.pages.length - 1;
  }

  public showElipsisCheck(index: number): boolean {
    return Math.abs(index - this.currentPageIndex) === 3 && index !== 0 && index !== this.pages.length - 1;
  }

  @HostListener('window:resize')
  private setIsBigWindow(): void {
    this.isBigWindow = window.innerWidth > 1000;
  }
}
