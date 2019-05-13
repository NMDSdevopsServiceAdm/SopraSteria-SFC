import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

// TODO: Update Auto Suggest to use CDK Overlay and scroll results

@Component({
  selector: 'app-auto-suggest',
  templateUrl: './auto-suggest.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoSuggestComponent),
      multi: true,
    },
  ],
})
export class AutoSuggestComponent implements ControlValueAccessor {
  onChange: Function;
  onTouched: Function;
  @Input() formControlName: string;
  @Input() formGroup: FormGroup;
  @Input() dataProvider: Function;

  constructor() {}

  onClick(value: string) {
    if (value) {
      this.formGroup.patchValue({
        [this.formControlName]: value,
      });
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
}
