import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { init } from '@sentry/browser';

@Component({
  selector: 'app-radio-button-accordion',
  templateUrl: './radio-button-accordion.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonAccordionComponent),
      multi: true,
    }
  ]
})
export class RadioButtonAccordionComponent implements ControlValueAccessor {
  @Input() title: string;
  @Input() formControlName?: string;
  @Input() controlName?: string;
  @Input() items: {
    id: number;
    label: string;
  }
  @Input() set open(isOpen: boolean) {
    this._open = isOpen !== undefined ? isOpen : false;
  }

  _open: boolean;
  @Output() toggleEmitter: EventEmitter<Event> = new EventEmitter();

  accordion = {
    open: this.open !== undefined ? this.open : false,
  };

  @Input('value') _value = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value): void {
    if(value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onClick(val: number) {
    this.value = val;
  }

  public emitToggle(): void {
    this.toggleEmitter.emit();

    console.log(this.accordion.open);
    if(this.open === undefined) {
      this.accordion.open = !this.accordion.open;
    }
  }
}
