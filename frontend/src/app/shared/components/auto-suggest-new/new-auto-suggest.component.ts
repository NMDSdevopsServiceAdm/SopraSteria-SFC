import { Component, computed, effect, EventEmitter, Input, OnInit, Output, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { AutoSuggestDataProvider } from '@shared/auto-suggest.model';

@Component({
  selector: 'app-new-auto-suggest',
  templateUrl: './new-auto-suggest.component.html',
  styleUrls: ['../auto-suggest/auto-suggest.component.scss'],
  standalone: false,
})
export class NewAutoSuggestComponent implements OnInit {
  @Input() inputBoxId: string = 'auto-suggest';
  @Input() dataProvider: AutoSuggestDataProvider;
  @Input() accessibleLabel: string = '';
  @Input() showEllipsis: boolean = false;
  @Input() hasError: boolean = false;
  @Output() emitInput: EventEmitter<string> = new EventEmitter();

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

  get suggestions(): Array<string> {
    return this._suggestions();
  }

  get value(): string | null {
    return this.textInput.value;
  }

  public onClick(chosenOption: string): void {
    this.showSuggestion.set(false);
    if (chosenOption) {
      this.textInput.setValue(chosenOption, { emitEvent: false });
      this.emitInput.emit(chosenOption);
    }
  }

  public clearTextInput(): void {
    this.textInput.patchValue(null);
  }
}
