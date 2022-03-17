import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { PaginationEmission } from '@core/model/pagination.model';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  public pages: Array<number>;
  public isBigWindow: boolean;

  @Input() noOfItemsOnPage: number;
  @Input() totalNoOfItems: number;
  @Output() emitCurrentPage = new EventEmitter<PaginationEmission>(true);

  private _currentPageIndex = 0;
  @Input() get currentPageIndex(): number {
    return this._currentPageIndex;
  }
  set currentPageIndex(pageIndex: number) {
    this.setPage(pageIndex);
  }

  ngOnInit(): void {
    this.pages = this.createPageIndexArray();
    this.setIsBigWindow();
  }

  public goToPage(e: Event, pageNo: number): void {
    e.preventDefault();
    this.setPage(pageNo);
  }

  private setPage(pageIndex: number): void {
    this._currentPageIndex = pageIndex;

    this.emitCurrentPage.emit({ pageIndex, noOfItemsOnPage: this.noOfItemsOnPage });
  }

  private createPageIndexArray(): Array<number> {
    const noOfPages = Math.ceil(this.totalNoOfItems / this.noOfItemsOnPage);
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
