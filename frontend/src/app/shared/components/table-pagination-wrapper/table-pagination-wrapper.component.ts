import { Component, contentChild, effect, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SearchInput } from '@core/model/admin/search.model';
import { SearchEvent } from '@core/model/pagination.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table-pagination-wrapper',
  templateUrl: './table-pagination-wrapper.component.html',
  styleUrl: './table-pagination-wrapper.component.scss',
  standalone: false,
})
export class TablePaginationWrapperComponent implements OnInit {
  private customSearchBox = contentChild<SearchInput>('searchBox');
  @Input() maintainedPageIndex: number;
  @Input() totalCount: number;
  @Input() count: number;
  @Input() sortByParamMap: Record<string, string>;
  @Input() sortByValue: string;
  @Input() sortOptions: Record<string, string>;
  @Input() searchTerm: string = '';
  @Input() label = 'Search';
  @Input() accessibleLabel: string;
  @Input() setQueryInParams: boolean = false;
  @Output() fetchData = new EventEmitter<SearchEvent>();
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  private fragment: string;
  private tab: string;
  public sortBySelected: string;
  private subscriptions: Subscription = new Subscription();

  constructor(private router: Router) {
    effect(() => {
      if (this.customSearchBox()) {
        this.setUpCustomSearchBox();
      }
    });
  }

  ngOnInit(): void {
    this.sortBySelected = Object.keys(this.sortByParamMap).find((key) => this.sortByParamMap[key] === this.sortByValue);
    if (this.maintainedPageIndex && this.maintainedPageIndex !== this.currentPageIndex) {
      this.currentPageIndex = this.maintainedPageIndex;
    }
  }

  private checkForFragment(): void {
    if (this.router.url.includes('#')) {
      this.fragment = this.router.url.split('#')[1];
      this.tab = this.fragment.split('-')[0];
    }
  }

  private addQueryParams(): void {
    this.checkForFragment();
    if (this.searchTerm) {
      this.router.navigate([], {
        fragment: this.fragment,
        queryParams: { search: this.searchTerm, tab: this.tab },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], { fragment: this.fragment });
    }
  }

  public sortBy(sortType: string): void {
    this.sortByValue = this.sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getData();
  }

  private setUpCustomSearchBox(): void {
    const customSearchBox = this.customSearchBox();
    if (!customSearchBox) {
      return;
    }

    this.subscriptions.add(
      customSearchBox.emitInput.subscribe((searchTerm) => {
        this.handleSearch(searchTerm);
      }),
    );
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;

    if (this.setQueryInParams) {
      this.addQueryParams();
    }

    this.getData();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
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

  private getData(): void {
    this.fetchData.emit(this.currentSearchParams);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
