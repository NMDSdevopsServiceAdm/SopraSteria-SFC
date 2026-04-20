import { EventEmitter } from '@angular/core';

export interface SearchWithCallback {
  searchTerm: string;
  callback?: (suggest: boolean) => void;
}

export interface SearchInput {
  emitSearchEvent: EventEmitter<SearchWithCallback>;
}
