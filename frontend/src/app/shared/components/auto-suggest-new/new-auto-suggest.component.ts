import { Component, computed, effect, EventEmitter, Input, OnInit, Output, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AutoSuggestDataProvider, AutoSuggestResult } from '@shared/auto-suggest.model';

@Component({
  selector: 'app-new-auto-suggest',
  templateUrl: './new-auto-suggest.component.html',
  styleUrls: ['../search-input/search-input.component.scss', '../auto-suggest/auto-suggest.component.scss'],
  standalone: false,
})
export class NewAutoSuggestComponent<T> implements OnInit {
  @Input() inputId: string = 'auto-suggest';
  @Input() dataProvider: AutoSuggestDataProvider<T>;
  @Input() showSearchIcon: boolean = false;
  @Input() showBackground: boolean = false;
  @Input() label: string;
  @Input() accessibleLabel: string = null;
  @Input() customClass: string = '';

  @Input() showEllipsis: boolean = false;
  @Input() hasError: boolean = false;
  @Output() searchButtonEvent: EventEmitter<Event> = new EventEmitter();
  @Output() clickItemEvent: EventEmitter<T> = new EventEmitter();

  public showSuggestion = signal(false);
  public textInput = new FormControl('');
  public searchTerm: Signal<string> = toSignal(this.textInput.valueChanges, { initialValue: '' });

  private _suggestions = computed(() => {
    const currentSearchTerm = this.searchTerm();
    if (!currentSearchTerm || !this.dataProvider) {
      return [];
    }

    return this.dataProvider(currentSearchTerm);
  });

  constructor() {
    effect(() => {
      if (this.suggestions?.length > 0) {
        this.showSuggestion.set(true);
      }
    });
  }

  ngOnInit(): void {}

  get suggestions(): Array<AutoSuggestResult<T>> {
    return this._suggestions();
  }

  public onClick(suggestResult: AutoSuggestResult<T>): void {
    this.showSuggestion.set(false);
    if (suggestResult) {
      this.textInput.setValue(suggestResult.suggestion, { emitEvent: false });
      this.clickItemEvent.emit(suggestResult.dataValue);
    }
  }

  public emitSearch(): void {
    this.showSuggestion.set(false);
    this.searchButtonEvent.emit();
  }
}
