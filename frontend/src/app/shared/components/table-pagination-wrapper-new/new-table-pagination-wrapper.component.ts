import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, contentChild, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SearchEvent } from '@core/model/pagination.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-table-pagination-wrapper',
  templateUrl: './new-table-pagination-wrapper.component.html',
  styleUrl: './new-table-pagination-wrapper.component.scss',
  standalone: false,
})
export class NewTablePaginationWrapperComponent implements OnInit, OnDestroy {
  private customSearchBox = contentChild('searchBox');

  @Input() maintainedPageIndex: number;
  @Input() totalCount: number;
  @Input() count: number;
  @Input() sortByParamMap: Record<string, string>;
  @Input() defaultSortByValue: string;
  @Input() sortOptions: Record<string, string>;
  @Input() searchTerm: string = '';
  @Input() label = 'Search';
  @Input() accessibleLabel: string;
  @Input() setQueryInParams: boolean = false;
  @Input() workplaceUid: string;
  @Output() fetchData = new EventEmitter<{
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }>();

  public sortByValue: string;
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  public sortBySelected: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
  ) {
    effect(() => {
      if (this.customSearchBox()) {
        this.setUpCustomSearchBox();
      }
    });
  }

  ngOnInit(): void {
    this.sortByValue = this.defaultSortByValue;
    this.sortBySelected = Object.keys(this.sortByParamMap).find((key) => this.sortByParamMap[key] === this.sortByValue);
    if (this.maintainedPageIndex && this.maintainedPageIndex !== this.currentPageIndex) {
      this.currentPageIndex = this.maintainedPageIndex;
    }
  }

  public sortBy(sortType: string): void {
    this.sortByValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getData();
  }

  public get currentSearchParams(): SearchEvent {
    return {
      index: this.currentPageIndex,
      itemsPerPage: this.itemsPerPage,
      searchTerm: this.searchTerm,
      sortByValue: this.sortByValue,
    };
  }

  private setUpCustomSearchBox(): void {
    const customSearchBox = this.customSearchBox();

    this.subscriptions.add(
      // @ts-expect-error
      customSearchBox.emitInput.subscribe((dataValue) => {
        const id = dataValue?.id?.toString();
        this.handleSearch(id);
      }),
    );
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
    this.fetchData.emit(this.currentSearchParams);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
