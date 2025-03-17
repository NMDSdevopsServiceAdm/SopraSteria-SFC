import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: NumberInputComponent,
    },
  ],
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() initialValue: number = null;
  @Input() min: number = 1;
  @Input() max: number = Infinity;
  @Input() labelText: string = '';
  @Input() id: string = 'number-input';

  touched = false;
  disabled = false;
  onTouched = () => {};
  onChange = (_newValue: number) => {};

  private _state: number;

  ngOnInit() {
    this.state = this.initialValue === null ? null : Number(this.initialValue);
    this.min = Number(this.min);
    this.max = Number(this.max);
  }

  get state(): number {
    return this._state;
  }

  set state(newValue: number) {
    this._state = newValue;
    this.onChange(this._state);
  }

  onInput(event: Event) {
    event.preventDefault();
    this.markAsTouched();

    this.writeValue((event.target as HTMLInputElement).value);
  }

  increase() {
    this.markAsTouched();
    if (!Number(this.state)) {
      this.state = Number(this.min);
      return;
    }

    this.state = Math.min(this.max, this.state + 1);
  }

  decrease() {
    this.markAsTouched();
    if (!Number(this.state)) {
      this.state = Number(this.min);
      return;
    }

    this.state = Math.max(this.min, this.state - 1);
  }

  writeValue(value: any) {
    const parsedValue = parseInt(value);

    this.state = isNaN(parsedValue) ? null : parsedValue;
  }

  registerOnChange(fn: (newValue: number) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
