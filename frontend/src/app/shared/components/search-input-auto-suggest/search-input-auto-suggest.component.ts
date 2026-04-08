import { Component, EventEmitter, Input, Output, viewChild } from '@angular/core';
import { AutoSuggestDataProvider, AutoSuggestResult } from '@shared/auto-suggest.model';
import { NewAutoSuggestComponent } from '../auto-suggest-new/new-auto-suggest.component';

@Component({
  selector: 'app-search-input-auto-suggest',
  templateUrl: './search-input-auto-suggest.component.html',
  styleUrls: ['./search-input-auto-suggest.component.scss'],
  standalone: false,
})
export class SearchInputAutoSuggestComponent<T> {
  @Input() dataProvider: AutoSuggestDataProvider<T>;

  @Input() ref = 'search';
  @Input() inputBoxId = this.ref; // bridge naming convention change
  @Input() searchButtonName = 'search';
  @Input() label = 'Search';
  @Input() accessibleLabel: string = '';
  @Input() showClearResults = true;
  @Input() showSearchIcon = false;

  @Output() emitInput = new EventEmitter<T>();

  private searchBox = viewChild.required<NewAutoSuggestComponent<T>>('searchBox');
  public searched = false;

  private setSearched(value: boolean): void {
    this.searched = value;
  }

  public handleOnSubmit(selectedOption: T): void {
    if (selectedOption) {
      this.emitInput.emit(selectedOption);
      this.setSearched(true);
    }
  }

  public handleResetSearch(): void {
    this.setSearched(false);
    this.emitInput.emit();
    this.searchBox().clearTextInput();
  }
}
