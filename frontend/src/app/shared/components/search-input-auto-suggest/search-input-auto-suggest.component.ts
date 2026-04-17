import { Component, EventEmitter, Input, Output, viewChild } from '@angular/core';
import { AutoSuggestDataProvider } from '@shared/auto-suggest.model';
import { NewAutoSuggestComponent } from '../auto-suggest-new/new-auto-suggest.component';
import { SearchInput } from '@core/model/admin/search.model';

@Component({
  selector: 'app-search-input-auto-suggest',
  templateUrl: './search-input-auto-suggest.component.html',
  styleUrls: ['../search-input/search-input.component.scss'],
  standalone: false,
})
export class SearchInputAutoSuggestComponent implements SearchInput {
  @Input() dataProvider: AutoSuggestDataProvider;

  @Input() ref = 'search';
  @Input() inputBoxId: string;
  @Input() searchButtonName = 'search';
  @Input() label = 'Search';
  @Input() accessibleLabel: string = '';
  @Input() showClearResults = true;
  @Input() showSearchButton = false;

  @Output() emitInput = new EventEmitter<string>();

  ngOnInit() {
    if (!this.inputBoxId && this.ref) {
      this.inputBoxId = this.ref;
    }
  }

  private searchBox = viewChild.required<NewAutoSuggestComponent>('searchBox');
  public searched = false;

  private setSearched(value: boolean): void {
    this.searched = value;
  }

  public handleSuggestionClick(selectedOption: string): void {
    if (selectedOption) {
      this.submitSearch(selectedOption);
    }
  }

  public handleSearchButtonClick(event: Event): void {
    event.preventDefault();
    const searchTerm = this.searchBox().value;
    if (searchTerm) {
      this.submitSearch(searchTerm);
    }
  }

  private submitSearch(searchTerm: string): void {
    this.emitInput.emit(searchTerm);
    this.setSearched(true);
  }

  public handleResetSearch(): void {
    this.setSearched(false);
    this.emitInput.emit('');
    this.searchBox().clearTextInput();
  }
}
