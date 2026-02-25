import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { inRange } from 'lodash';

type OnChangeFunction = (newValue: number | string) => void;

@Component({
  selector: 'app-decimal-input-with-buttons',
  templateUrl: './decimal-input-with-buttons.component.html',
  styleUrls: ['./decimal-input-with-buttons.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DecimalInputWithButtonsComponent,
    },
  ],
  standalone: false,
})
export class DecimalInputWithButtonsComponent implements ControlValueAccessor, OnInit {
  @Input() initialValue: number = null;
  @Input() min: number = 1;
  @Input() max: number = 999;
  @Input() inputId: string = 'number-input';
  @Input() hasError: boolean = false;
  @Input() suffix: string = null;
  @Input() step: number = 1;

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;

  public showPlusButton: boolean = true;
  public showMinusButton: boolean = false;
  public touched = false;
  public disabled = false;
  private onTouched = () => {};
  private onChangeFunctions: Array<OnChangeFunction> = [];

  ngOnInit(): void {
    this.min = Number(this.min);
    this.max = Number(this.max);
    this.writeValue(this.initialValue);
    this.checkWhetherButtonsShowup();
  }

  get numberInput(): HTMLInputElement {
    return this.inputEl.nativeElement;
  }

  get currentNumber(): number {
    return parseFloat(this.numberInput.value);
  }

  public writeValue(newValue: number | string | null): void {
    this.numberInput.value = newValue as string;
    this.checkWhetherButtonsShowup();
    this.onChange(newValue);
  }

  private checkWhetherButtonsShowup(): void {
    this.showPlusButton = isNaN(this.currentNumber) || this.currentNumber < this.max;
    this.showMinusButton = !isNaN(this.currentNumber) && this.currentNumber > this.min;
  }

  onInput(event: Event): void {
    event.preventDefault();
    this.markAsTouched();

    const rawValue = this.numberInput.value;

    // Allow empty and partial decimal input while typing
    if (rawValue === '' || rawValue === '.' || rawValue.endsWith('.')) {
      this.onChange(rawValue);
      return;
    }

    const parsed = parseFloat(rawValue);

    if (!isNaN(parsed)) {
      this.checkWhetherButtonsShowup();
      this.onChange(parsed);
    }
  }

  increase(): void {
    this.markAsTouched();
    if (isNaN(this.currentNumber)) {
      this.writeValue(this.min);
      return;
    }

    const newValue = this.currentNumber + 0.5;

    if (this.outOfRange(newValue)) {
      this.writeValue(this.min);
    } else {
      this.writeValue(newValue);
    }
  }

  decrease(): void {
    this.markAsTouched();
    if (isNaN(this.currentNumber)) {
      this.writeValue(this.min);
      return;
    }

    const newValue = this.currentNumber - 0.5;

    if (this.outOfRange(newValue)) {
      this.writeValue(this.max);
    } else {
      this.writeValue(newValue);
    }
  }

  private outOfRange(newValue: number): boolean {
    return !inRange(newValue, this.min - 0.5, this.max + 0.5);
  }

  private onChange = (newValue: number | string) => {
    this.onChangeFunctions.forEach((fn) => fn(newValue));
  };

  public registerOnChange(fn: OnChangeFunction): void {
    this.onChangeFunctions.push(fn);
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
