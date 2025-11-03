import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
// TODO: Update Auto Suggest to use CDK Overlay and scroll results

@Component({
    selector: 'app-auto-suggest',
    templateUrl: './auto-suggest.component.html',
    styleUrls: ['./../search-input/search-input.component.scss', './auto-suggest.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutoSuggestComponent),
            multi: true,
        },
    ],
    standalone: false
})
export class AutoSuggestComponent implements ControlValueAccessor {
  onChange: Function;
  onTouched: Function;
  @Input() formControlName: string;
  @Input() formGroup: UntypedFormGroup;
  @Input() dataProvider: Function;
  @Input() error = false;
  @Input() showSearchIcon: boolean = false;
  @Input() showBackground: boolean = false;
  @Input() label: string;
  @Input() accessibleLabel: string = null;
  @Input() showClickedSuggestionInInput: boolean = true;
  @Output() searchButtonEvent: EventEmitter<Event> = new EventEmitter();
  @Output() clickItemEvent: EventEmitter<string> = new EventEmitter();

  constructor() {}

  onClick(value: string) {
    if (value) {
      if (this.showClickedSuggestionInInput) {
        this.formGroup.patchValue({
          [this.formControlName]: value,
        });
      }
      this.clickItemEvent.emit(value);
    }
  }

  writeValue(value: any): void {
    // let's do nothing here and delegate model binding in input field
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public emitSearch(): void {
    this.searchButtonEvent.emit();
  }
}
