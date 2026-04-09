import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchInput } from '@core/model/admin/search.model';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  standalone: false,
})
export class SearchInputComponent implements SearchInput {
  @Input() ref = 'search';
  @Input() searchButtonName = 'search';
  @Input() label = 'Search';
  @Input() showSearchIcon: boolean = false;
  @Input() accessibleLabel: string;
  @Input() set prevSearch(value: string) {
    if (value.trim() !== this.searchTerm.trim()) {
      this.setSearchTerm(value);
      this.setSearched(true);
      this.emitInput.emit(this.searchTerm);
    }
  }
  // remove the clear search results from being shown in this component
  @Input() showClearResults = true;

  @Output() emitInput = new EventEmitter<string>();

  public searched = false;
  public searchTerm = '';

  private setSearched(value: boolean): void {
    this.searched = value;
  }

  private setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  public handleOnInput(e: Event): void {
    const searchValue = (<HTMLInputElement>e.target).value;
    this.setSearchTerm(searchValue);
  }

  public handleOnSubmit(e: Event): void {
    e.preventDefault();

    if (this.searchTerm.trim().length) {
      this.emitInput.emit(this.searchTerm);
      this.setSearched(true);
    }
  }

  public handleResetSearch(): void {
    this.setSearched(false);
    this.setSearchTerm('');
    this.emitInput.emit(this.searchTerm);
  }
}
