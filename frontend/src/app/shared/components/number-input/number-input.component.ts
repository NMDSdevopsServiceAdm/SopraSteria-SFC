import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { inRange } from 'lodash';

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
  @Input() inputId: string = 'number-input';
  @Input() hasError: boolean = false;

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;

  public touched = false;
  public disabled = false;
  private onTouched = () => {};
  private onChange = (_newValue: number | string) => {};
  public showPlusButton: boolean = true;
  public showMinusButton: boolean = false;

  ngOnInit() {
    this.min = Number(this.min);
    this.max = Number(this.max);
    this.writeValue(this.initialValue);
    this.checkWhetherButtonsShowup();
  }

  get numberInput() {
    return this.inputEl.nativeElement;
  }

  get currentNumber(): number {
    const currentValue = this.numberInput.value;
    return parseInt(currentValue);
  }

  public writeValue(newValue: any): void {
    this.numberInput.value = newValue;
    this.checkWhetherButtonsShowup();
    this.onChange(newValue);
  }

  private checkWhetherButtonsShowup(): void {
    this.showPlusButton = isNaN(this.currentNumber) || this.currentNumber < this.max;
    this.showMinusButton = !isNaN(this.currentNumber) && this.currentNumber > this.min;
  }

  onInput(event: Event) {
    event.preventDefault();
    this.markAsTouched();

    if (isNaN(this.currentNumber)) {
      this.writeValue(this.numberInput.value); // if not a valid number, emit as string
    } else {
      this.writeValue(this.currentNumber);
    }
  }

  increase() {
    this.markAsTouched();
    if (isNaN(this.currentNumber)) {
      this.writeValue(this.min);
      return;
    }

    const newValue = this.currentNumber + 1;

    if (inRange(newValue, this.min - 1, this.max + 1)) {
      this.writeValue(newValue);
    } else {
      this.writeValue(this.min);
    }
  }

  decrease() {
    this.markAsTouched();
    if (isNaN(this.currentNumber)) {
      this.writeValue(this.min);
      return;
    }

    const newValue = this.currentNumber - 1;

    if (inRange(newValue, this.min - 1, this.max + 1)) {
      this.writeValue(newValue);
    } else {
      this.writeValue(this.max);
    }
  }

  public registerOnChange(fn: (newValue: number) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
