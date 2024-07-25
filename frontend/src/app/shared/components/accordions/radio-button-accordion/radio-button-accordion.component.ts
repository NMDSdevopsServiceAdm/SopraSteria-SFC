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
    },
  ],
})
export class RadioButtonAccordionComponent implements ControlValueAccessor {
  @Input() title: string;
  @Input() formControlName?: string;
  @Input() controlName?: string;
  @Input() items: {
    id: number;
    label: string;
  };
  @Input() set open(isOpen: boolean) {
    this._open = isOpen !== undefined ? isOpen : false;
  }

  _open: boolean;
  @Output() toggleEmitter: EventEmitter<Event> = new EventEmitter();
  @Output() selectedValueEmitter: EventEmitter<number> = new EventEmitter();

  @Input('value') _value = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  get open() {
    return this._open;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.selectedValueEmitter.emit(val);
    this.onTouched();
  }

  writeValue(value): void {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onClick(val: any) {
    this.value = { id: val.id, label: val.label };
  }

  public emitToggle(): void {
    this.toggleEmitter.emit();

    if (this.open === undefined) {
      this.open = !this.open;
    }
  }
}
