import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent {
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
    this.emitInput.emit(this.searchTerm);
    this.setSearched(true);
  }

  public handleResetSearch(): void {
    this.setSearched(false);
    this.setSearchTerm('');
  }
}
