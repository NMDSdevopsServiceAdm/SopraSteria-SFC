import { Component, computed, effect, EventEmitter, Input, OnInit, Output, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { AutoSuggestDataProvider, AutoSuggestResult } from '@shared/auto-suggest.model';

@Component({
  selector: 'app-new-auto-suggest',
  templateUrl: './new-auto-suggest.component.html',
  styleUrls: ['../auto-suggest/auto-suggest.component.scss'],
  standalone: false,
})
export class NewAutoSuggestComponent<T> implements OnInit {
  @Input() inputBoxId: string = 'auto-suggest';
  @Input() dataProvider: AutoSuggestDataProvider<T>;
  @Input() accessibleLabel: string = '';
  @Input() showEllipsis: boolean = false;
  @Input() hasError: boolean = false;
  @Output() emitInput: EventEmitter<T> = new EventEmitter();

  public showSuggestion = signal(false);
  public textInput = new FormControl('');
  public inputSignal: Signal<string | null> = toSignal(this.textInput.valueChanges, { initialValue: '' });

  private _suggestions = computed(() => {
    const currentInputValue = this.inputSignal();
    if (!currentInputValue || !this.dataProvider) {
      return [];
    }

    return this.dataProvider(currentInputValue);
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
      this.emitInput.emit(suggestResult.dataValue);
    }
  }

  public clearTextInput(): void {
    this.textInput.patchValue(null);
  }
}
